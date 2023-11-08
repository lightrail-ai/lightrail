import { LightrailTrack, HumanMessage } from "lightrail-sdk";
import parseDatabaseUrl from "./parse-database-url";
import { marked } from "marked";

declare function require(module: string): any;

export default {
  name: "sql", // Everything except name is optional
  tokens: [
    {
      name: "db",
      color: "#d47131",
      description: "A reference to a SQL database",
      args: [
        {
          type: "history",
          key: "dbConnectionUrl",
          name: "dbConnectionUrl",
          description: "The connection URL for the database",
        },
      ],
      async hydrate(_, args, prompt) {
        const postgres = require("postgres");
        const parsed = parseDatabaseUrl(args.dbConnectionUrl);
        const sql = postgres(args.dbConnectionUrl);
        const allColumns = await sql`
          SELECT table_schema, table_name, column_name, data_type
          FROM information_schema.columns
          WHERE table_schema != 'pg_catalog' AND table_schema != 'information_schema'
          ORDER BY table_name, column_name;
        `;

        const groupedColumns = allColumns.reduce((acc, col) => {
          if (!acc[col.table_name]) {
            acc[col.table_name] = [];
          }
          acc[col.table_name].push(col);
          return acc;
        }, {});

        const tableDescriptionString = Object.entries(groupedColumns)
          .map(([tableName, _columns]) => {
            const columns = _columns as any[];
            return `${
              columns[0].table_schema ? columns[0].table_schema + "." : ""
            }${tableName} (Columns: ${columns
              .map((c) => `${c.column_name} [${c.data_type}]`)
              .join(", ")})`;
          })
          .join("\n");

        const dbIdentifier =
          "the database at " + parsed.host + "/" + parsed.database;

        prompt.appendContextItem({
          content: tableDescriptionString,
          title: dbIdentifier + " contains these tables:",
          type: "text",
          metadata: {
            type: "database",
            connection: args.dbConnectionUrl,
          },
        });

        prompt.appendText(dbIdentifier);
      },
      render(args) {
        const parsed = parseDatabaseUrl(args.dbConnectionUrl);
        return [parsed.host + "/" + parsed.database];
      },
    },

    {
      name: "table",
      color: "#d47131",
      description: "A reference to a table in a SQL database",
      args: [
        {
          type: "history",
          key: "dbConnectionUrl",
          name: "dbConnectionUrl",
          description: "The connection URL for the database",
        },
        {
          type: "custom",
          name: "tableName",
          description: "The name of the table",
          async handler(handle, args) {
            const postgres = require("postgres");
            const sql = postgres(args.dbConnectionUrl);
            const part = args.tableName;
            const tables = await sql`
              SELECT tablename, schemaname
              FROM pg_catalog.pg_tables
              WHERE schemaname != 'pg_catalog' AND 
                  schemaname != 'information_schema'
              ORDER BY CASE WHEN schemaname = 'public' THEN 1 ELSE 2 END, tablename;
            `;

            return tables
              .filter((t) =>
                part ? `${t.schemaname}.${t.tablename}`.includes(part) : true
              )
              .map((t) => ({
                name: t.tablename,
                value: `${t.schemaname}.${t.tablename} `,
                description: t.schemaname,
              }));
          },
        },
      ],
      async hydrate(mainHandle, args, prompt) {
        const postgres = require("postgres");
        const sql = postgres(args.dbConnectionUrl);
        const [schema, table, _] = args.tableName.split(/\.(.*)/s);
        const columns = await sql`
          SELECT column_name, data_type
          FROM information_schema.columns
          WHERE table_schema = ${schema} AND table_name = ${table}
        `;

        const tableIdentifier = `the database table \`${
          schema !== "public" ? schema + "." : ""
        }${table}\``;

        prompt.appendContextItem({
          content: columns
            .map((c) => `${c.column_name} [${c.data_type}]`)
            .join("\n"),
          title: tableIdentifier + " contains these columns:",
          type: "text",
          metadata: {
            type: "database",
            connection: args.dbConnectionUrl,
          },
        });

        prompt.appendText(tableIdentifier);
      },
      render(args) {
        return [args.tableName];
      },
    },
  ],
  actions: [
    {
      name: "Query DB",
      description: "Write (& optionally run) a SQL query against a DB",
      color: "#d47131",
      icon: "chart-bar",
      args: [],
      async handler(handle, userPrompt) {
        handle.sendMessageToRenderer("new-message", {
          message: {
            sender: "user",
            content: userPrompt._json,
          },
        });

        await userPrompt.hydrate(handle);

        const connection = userPrompt._context.find(
          (c) => c.metadata?.type === "database" && c.metadata?.connection
        )?.metadata.connection;

        if (!connection) {
          throw new Error(
            "No database connection URL provided. Please use /sql.db or /sql.table to refer to the database you'd like to query in your prompt."
          );
        }

        userPrompt.appendText(
          "\n\nYour output should be a single SQL query. Output only the query, in a code-block. Do not output anything outside of the code block. The query must be runnable as-is, against the tables/databased specified in the prompt."
        );

        const response = await handle.llm.chat.converse(
          // @ts-ignore
          [new HumanMessage(userPrompt.toMessage())],
          {
            callbacks: [
              {
                handleLLMNewToken: (token) =>
                  handle.sendMessageToRenderer("new-token", token),
                handleLLMError: (error) => {
                  throw new Error(error.message);
                },
              },
            ],
          }
        );
        handle.sendMessageToRenderer("new-message", {
          message: {
            sender: "ai",
            content: response.content,
          },
          connection,
        });
      },
    },
  ],
  handlers: {
    main: {
      "run-query": async (handle, { query, connection }) => {
        const postgres = require("postgres");
        const sql = postgres(connection);
        const results = await sql.unsafe(query);
        handle.sendMessageToRenderer("query-results", results);
      },
    },
    renderer: {
      "query-results": async (rendererHandle, results) => {
        rendererHandle.ui?.controls.setControls([
          {
            type: "data-table",
            data: results,
          },
        ]);
      },

      "new-token": async (rendererHandle, token) =>
        rendererHandle.ui?.chat.setPartialMessage((prev) =>
          prev ? prev + token : token
        ),
      "new-message": async (rendererHandle, { message, connection }) => {
        rendererHandle.ui?.chat.setPartialMessage(null);
        rendererHandle.ui?.chat.setHistory((prev) => [...prev, message]);

        if (message.sender === "ai" && connection) {
          const tokens = marked.lexer(message.content);
          const query = tokens.find((token) => token.type === "code");

          if (query && query.type === "code") {
            rendererHandle.ui?.controls.setControls([
              {
                type: "buttons",
                buttons: [
                  {
                    label: "Discard",
                    onClick: () => {
                      rendererHandle.ui?.controls.setControls([]);
                    },
                  },
                  {
                    label: "Run",
                    color: "primary",
                    onClick: () => {
                      rendererHandle.sendMessageToMain("run-query", {
                        query: query.text,
                        connection,
                      });
                    },
                  },
                ],
              },
            ]);
          }
        }
      },
    },
  },
} satisfies LightrailTrack;
