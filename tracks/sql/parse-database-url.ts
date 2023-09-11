import * as mUri from "mongodb-uri";
import querystring from "query-string";
/*
   Modified from: https://github.com/herlon214/ts-parse-database-url
   MIT License
*/

export class DatabaseConfig {
  public readonly driver?: string;
  public readonly user?: string;
  public readonly password?: string;
  public readonly host?: string;
  public readonly port?: number;
  public readonly database?: string;
  public readonly filename?: string; // For SQLite
  public readonly hosts?: any; // For MongoDB
}

export default function (databaseUrl: string): DatabaseConfig {
  let parsedUrl = new URL(databaseUrl);
  const protocol = parsedUrl.protocol;
  console.log(protocol);
  const ftpStyleUrl = databaseUrl.replace(protocol, "ftp:");
  console.log(ftpStyleUrl);
  parsedUrl = new URL(ftpStyleUrl);
  console.log(parsedUrl);
  let config = querystring.parse(parsedUrl.search);

  // Fix trailing :
  config.driver = (protocol || "sqlite3:").replace(/\:$/, "");

  // Cloud Foundry fix
  if (config.driver == "mysql2") config.driver = "mysql";

  // url.parse() produces an "auth" that looks like "user:password". No
  // individual fields, unfortunately.
  if (parsedUrl.username) {
    config.user = parsedUrl.username;
  }
  if (parsedUrl.password) {
    config.password = parsedUrl.password;
  }

  if (config.driver === "sqlite3") {
    if (parsedUrl.hostname) {
      if (parsedUrl.pathname) {
        // Relative path.
        config.filename = parsedUrl.hostname + parsedUrl.pathname;
      } else {
        // Just a filename.
        config.filename = parsedUrl.hostname;
      }
    } else {
      // Absolute path.
      config.filename = parsedUrl.pathname;
    }
  } else {
    if (config.driver === "mongodb") {
      // MongoDB URLs can have multiple comma-separated host:port pairs. This
      // trips up the standard URL parser.
      var mongoParsedUrl = mUri.parse(databaseUrl);
      let mongoUrl: any = {};
      if (mongoParsedUrl.hosts) {
        mongoUrl.hosts = mongoParsedUrl.hosts;
        for (var i = 0; i < mongoUrl.hosts.length; i += 1) {
          if (mongoUrl.hosts[i].port)
            mongoUrl.hosts[i].port = mongoUrl.hosts[i].port.toString();
        }
        if (mongoUrl.hosts.length === 1) {
          if (mongoUrl.hosts[0].host) mongoUrl.host = mongoUrl.hosts[0].host;
          if (mongoUrl.hosts[0].port)
            mongoUrl.port = mongoUrl.hosts[0].port.toString();
        }
      }
      if (mongoParsedUrl.database) mongoUrl.database = mongoParsedUrl.database;

      config = { ...config, ...mongoUrl };
    } else {
      // Some drivers (e.g., redis) don't have database names.
      if (parsedUrl.pathname) {
        config.database = parsedUrl.pathname
          .replace(/^\//, "")
          .replace(/\/$/, "");
      }
    }

    if (parsedUrl.hostname) config.host = parsedUrl.hostname;
    if (parsedUrl.port) config.port = parsedUrl.port;
  }

  return <DatabaseConfig>config;
}
