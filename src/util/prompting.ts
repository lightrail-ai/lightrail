import { File, FileUpdate } from "./storage";

import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAI } from "langchain/llms/openai";
import {
  AIChatMessage,
  HumanChatMessage,
  SystemChatMessage,
} from "langchain/schema";
import { CompleteLibrary, type Library } from "./starter-library";
import { SERVER_URL } from "./constants";

const chat = new ChatOpenAI({
  modelName: "gpt-3.5-turbo-0613",
  openAIApiKey: process.env.OPENAI_API_KEY,
  maxConcurrency: 5,
  streaming: true,
});

const chat4 = new ChatOpenAI({
  modelName: "gpt-4",
  openAIApiKey: process.env.OPENAI_API_KEY,
  maxConcurrency: 5,
  streaming: true,
});

const completion = new OpenAI({
  modelName: "text-davinci-003",
  maxTokens: -1,
  stop: ["```"],
  openAIApiKey: process.env.OPENAI_API_KEY,
  maxConcurrency: 5,
  streaming: true,
});

export function cleanJSX(jsx: string) {
  let cleaned = jsx.replaceAll(" class=", " className=");
  cleaned = cleaned.replaceAll(" for=", " htmlFor=");
  return cleaned;
}

function getProjectSpecificLibrary(libraries: string[]): Library {
  return Object.fromEntries(
    Object.entries(CompleteLibrary).filter(([_, details]) =>
      details.categories.some((c) => libraries.includes(c))
    )
  );
}

function formatLibraryForPrompt(lib: Library) {
  return Object.entries(lib)
    .map(
      ([name, details]) =>
        `${name}: ${details.description} (example usage: ${details.example})`
    )
    .join("\n");
}

function getComponentsFromLibrary(lib: Library) {
  return Object.keys(lib);
}

export async function generateRoot(
  name: string,
  description: string,
  libraries: string[],
  streamingCallback?: (token: string) => void
): Promise<File[]> {
  const usableLibrary = getProjectSpecificLibrary(libraries);

  const system = `
        You are a helpful assistant for a React developer.
        You are given a description, and you generate an array of React components in the JSON format specified:

        \`\`\` 
        {
          "name": "...",   // The name of the component
          "dependencies": ["...", "..."],    // Other compoents that this component uses. List only the names of custom components
          "props": ["...", "..."],   // The props that this component uses
          "render": "...",    // The JSX for the component, as a string. Use only Tailwind CSS for styling. 
        }
        \`\`\`

        You output only JSON arrays. 
        
  `;

  const initialPrompt = `

        Using the React Component serialization exemplified here: 

        \`\`\`
        {
            "name": "ComponentName",
            "dependencies": ["Button", "PricingCard"],
            "props": ["price", "cta"],
            "render": "<div className=\"bg-slate-200 p-4\">\\n  <PricingCard price={props.price} />\\n  <Button text={props.cta} />\\n</div>",
        }
        \`\`\`

        generate an array of React components (use Tailwind CSS) for a project called "${name}" that fulfills this description: "${description}"

        You should create components in a modular, reusable, well-organized way. 
        Start with the smallest, lowest-level component you'll need (i.e. components with no dependencies).
        Then, build up to the top-level component, using the components you've already created. 
        You should create components that describe semantic sections of the output, as well as components for sepcific reusable UI elements.
        The final component should be called Index, and should be the top-level component, representing the webpage as a whole. 
        For each component, list the other components that it uses in the "dependencies" key of its JSON. 
        The "dependencies" list should ONLY include component names, not any other functions or libraries.
        The "render" key of each component's JSON should be JSX (as a string) & styled with Tailwind CSS classes.
        Font Awesome icons are available to you, as css classes.
        Make all designs responsive, modern, and clean. Do not use bright colors excessively. 
        Make sure no components are left unimplemented.
        If a component requires props, provide those props with sample values whenever that component is used.
        When accessing props in the JSX, use the format \`props.propName\` to access the prop value. A component's children are available as \`props.children\`.

        The following components can also be used implementing them yourself, IF they are appropriate for the description requested:

        ${formatLibraryForPrompt(usableLibrary)}

        ONLY use components from that list if they are appropriate for the description requested. You will be penalized for misusing them.  
        Make sure ALL data is provided to each component whenever it is used, making up whatever data necessary, so that the component can be rendered without errors.
        All JSX should be valid React JSX (i.e. use className for classes, every tag should be self-closing or have a closing tag, etc.)
        Respond only with an array of RFC-compliant JSON objects and no other content, comments, titles, explanations, or text.`;

  let messages = [
    new SystemChatMessage(system),
    new HumanChatMessage(initialPrompt),
  ];

  let rawResponse = await chat4.call(messages, undefined, [
    {
      handleLLMNewToken: streamingCallback,
    },
  ]);

  const responseString = rawResponse.text;

  console.log(initialPrompt);
  console.log(responseString);

  let cleanedResponse = responseString
    .replace(/^[^\[]*\[/, "[")
    .replace(/\][^\]]*$/, "]");

  console.log(cleanedResponse);

  let response;

  try {
    response = JSON.parse(cleanedResponse);
  } catch (e) {
    cleanedResponse = cleanedResponse.replaceAll(
      /"render":\s*`(.+?[^\\])`/gms,
      (_, jsxstr) =>
        `"render": ${JSON.stringify(jsxstr.replaceAll("\\`", "`"))}`
    );
    try {
      response = JSON.parse(cleanedResponse);
    } catch (e) {
      cleanedResponse = cleanedResponse.replaceAll("\n", " ");
      try {
        response = JSON.parse(cleanedResponse);
      } catch (e) {
        cleanedResponse = cleanedResponse.replace(/(.*}),\s*{.*$/gs, "$1]");
        response = JSON.parse(cleanedResponse);
      }
    }
  }

  let files: File[] = response.map((comp: any) => ({
    path: comp.name === "Index" ? "index" : comp.name,
    contents: cleanJSX(comp.render),
  }));

  console.log(files);

  let usedLibraryComponents = new Set<keyof typeof usableLibrary>();
  let libraryComponents = getComponentsFromLibrary(usableLibrary);

  files = files
    .filter((file) => {
      return !libraryComponents.includes(file.path);
    })
    .map((file) => {
      for (const libComp of libraryComponents) {
        if (file.contents?.match(new RegExp(`<${libComp}\\W`))) {
          usedLibraryComponents.add(libComp);
          file.contents = file.contents?.replaceAll(
            new RegExp(`<${libComp}(\\W)`, "g"),
            `<${usableLibrary[libComp].as}$1`
          );
          file.contents = file.contents?.replaceAll(
            `</${libComp}>`,
            `</${usableLibrary[libComp].as}>`
          );
        }
      }

      return file;
    });

  for (const libComp of Array.from(usedLibraryComponents)) {
    const contentsPath = usableLibrary[libComp].src;
    const resp = await fetch(
      SERVER_URL + "/starter-components/" + contentsPath
    );
    const contents = await resp.text();

    files.push({
      path: usableLibrary[libComp].as,
      contents,
    } as File);
  }

  return files;
}

export async function generateComponent(
  name: string,
  props: string[],
  description: string,
  streamingCallback?: (token: string) => void
) {
  const system = `
  You are a helpful assistant for a React developer.
  You are given a name, list of props, and description for a component, and you generate a serialized React component in this JSON format:

  \`\`\` 
  {
    "name": "...",   // The name of the component
    "props": ["...", "..."],   // The props that this component uses
    "state": ["...", "..."]   // The state that this component uses. 
    "render": "...",    // The JSX for the component, as a string. Use only Tailwind CSS for styling. Use only props requested in the description.
  }
  \`\`\`
  
`;

  const initialPrompt = `
  Generate a JSON-serialized React component for the provided name/props/description. For example, if given the input:

  Name: Counter
  Props: delta
  Description: A counter input that starts at 0 and allows the user to change the value by the specified delta. 

  You produce:

  \`\`\`
  {
      "name": "Counter",   // The name of the component, as a string
      "props": ["delta"],   // The props that this component uses
      "state": [{name: "count", initial: 0}] // The state that this component uses. Each state variable has a name and an initial value.
      "render": "<div className=\"flex items-center\">\n    <button className=\"bg-blue-400 hover:bg-blue-500 text-white font-bold py-1 px-2 rounded-l-md\" onClick={() => setCount(count - props.delta)}>-</button>\n        <div className=\"bg-white px-3 py-1 text-center border border-gray-300\">\n            {count}\n        </div>\n    <button className=\"bg-blue-400 hover:bg-blue-500 text-white font-bold py-1 px-2 rounded-r-md\" onClick={() => setCount(count + props.delta)}>+</button>\n</div>",    // The JSX for the component, as a one-line string. Use only Tailwind CSS for styling. 
  }
  \`\`\`

  The JSX you generate should only use Tailwind CSS for styling. Font Awesome icons are also available to you, as css classes.
  When accessing props in the JSX, use the format \`props.propName\` to access the prop value. A component's children are available as \`props.children\`. 
  When accessing state in the JSX, use the state variable name (e.g. \`count\`) to access the state value, and the corresponding setter (e.g. \`setCount\`) to set the state value.
  Define all event-handlers inline. All JSX should be valid React JSX (i.e. use className for classes, every tag should be self-closing or have a closing tag, etc.).
  Make sure each component uses all the required props and doesn't use any props that aren't requested. 

  Here is your input:

  Name: ${name}
  Props: ${props.join(", ")}
  Description: ${description}

  Make sure to respond only with a JSON object in the specified format and no other content or text. Do not have any text before or after the JSON. Do not output any explanation.`;

  let messages = [
    new SystemChatMessage(system),
    new HumanChatMessage(initialPrompt),
  ];

  let rawResponse = await chat4.call(messages, undefined, [
    {
      handleLLMNewToken: streamingCallback,
    },
  ]);

  const responseString = rawResponse.text;

  const jsonResponse = responseString
    .replace(/^[^{]*{/, "{")
    .replace(/}[^}]*$/, "}");

  let parsed;
  try {
    parsed = JSON.parse(jsonResponse);
    if (!parsed.name || !parsed.render) {
      throw new Error("Invalid JSON");
    }
  } catch (e) {
    console.log(e);
    parsed = {
      name,
      render: `<div>${name}</div>`,
    };
  }

  console.log(parsed);

  return {
    path: name,
    contents: cleanJSX(parsed.render),
    state: parsed.state,
  };
}

export async function modifyComponent(
  old: File,
  modification: string,
  streamingCallback?: (token: string) => void
): Promise<{
  explanation: string;
  update: FileUpdate;
}> {
  const system = `
        You are a helpful JSON API for a React developer, and you modify React components to satisfy a description of a change or issue to fix.
        You receive requests as a React component serialized in a JSON format, along with a description of a modification, and you respond with an explanation of the changes 
        made as well as the updated component in the same serialized JSON format.`;
  const prompt = `
        I will give you a serialized JSON object representing a React component, as well as a modification to make to the component. 
        You modify the component to satisfy the modification and return it along with an explanation of your changes.
        You can add or remove state variables, or modify the JSX. For any state variables, you can use the state variable name (e.g. \`count\`) to access the state value,
        and the corresponding setter (e.g. \`setCount\`) to set the state value. Define all event-handlers inline. Props are accessed as \`props.propName\` in the JSX.
        My request will be JSON with the keys "component" (the serialized component) and "modification" (a string with a change description),
        and you should send back a response with the keys "explanation" (a string) and "component" (an updated serialized component).
        
        Do not assume that any custom components exist that aren't already used; use only standard HTML elements in your changes. Do not rely on any external libraries.
        Only use Tailwind CSS for styling. You can use Font Awesome icons, as CSS classes. 
        
        Here's my request:
        
        \`\`\`
        {
          "component": {
            "name": ${JSON.stringify(old.path)},
            "state": ${JSON.stringify(old.state || [])},
            "render": ${JSON.stringify(old.contents)},
          },
          "modification": "${modification}"
        }
        \`\`\``;

  const rawResponse = await chat.call(
    [new SystemChatMessage(system), new HumanChatMessage(prompt)],
    {
      functions: [
        {
          name: "send_component",
          description:
            "Send the developer the modified component with an explanation of the changes made.",
          parameters: {
            type: "object",
            properties: {
              explanation: {
                type: "string",
                description: "The explanation of the changes made.",
              },
              component: {
                type: "object",
                description: "The modified, serialized component.",
                properties: {
                  name: {
                    type: "string",
                    description:
                      'The name of the component (e.g. "ComponentName")',
                  },
                  state: {
                    type: "array",
                    items: {
                      type: "object",
                      description:
                        'The state variables that this component uses (e.g. [{name: "count", initial: 0}, {name: "text", initial: ""}])',
                      properties: {
                        name: {
                          type: "string",
                          description: "The name of the state variable",
                        },
                        initial: {
                          type: "string",
                          description:
                            "The initial value of the state variable",
                        },
                      },
                    },
                  },
                  render: {
                    type: "string",
                    description:
                      'The JSX component tree for the component, as a string. Use Tailwind CSS for styling. (e.g. "<div className=\\"bg-slate-200 p-4\\">\\n  <PricingCard price={props.price} />\\n  <Button text={props.cta} />\\n</div>")',
                  },
                },
              },
            },
          },
        },
      ],
      function_call: {
        name: "send_component",
      },
    },
    [
      {
        handleLLMNewToken: streamingCallback,
      },
    ]
  );

  const responseFunctionCall = rawResponse.additional_kwargs[
    "function_call"
  ] as any;
  const responseArgString = responseFunctionCall["arguments"];

  console.log(responseArgString);

  const response = JSON.parse(responseArgString);

  console.log(response);

  return {
    explanation: response.explanation,
    update: {
      state: response.component.state,
      contents: cleanJSX(response.component.render),
    },
  };
}

export async function modifyComponentWithCompletion(
  old: string,
  modification: string,
  streamingCallback?: (token: string) => void
) {
  const responseString = await completion.call(
    `
    Modify the following JSX component tree to match this description / request: "${modification}".

    \`\`\`
    ${old}
    \`\`\`
    
    Present the modification as a JSON object with format {"explanation": "...", "jsx": "..."}, where the \`explanation\` explains the specific DOM/css-class changes made and why, and the \`jsx\` is the updated React component tree styled with Tailwind CSS classes, as a string.
    
    \`\`\`
    {
         "explanation": "`,
    undefined,
    [
      {
        handleLLMNewToken: streamingCallback,
      },
    ]
  );

  console.log(responseString);

  let parsed;

  try {
    const jsonResponse = `{ "explanation": "${responseString}`;
    parsed = JSON.parse(jsonResponse);
    if (!parsed.explanation || !parsed.jsx) {
      throw new Error("Invalid response");
    }
  } catch (e) {
    console.warn("JSON parse failed, constructing manually");
    const parts = responseString!.split(/\s*"jsx"\s*:\s*/);
    const explanation = parts[0].replace(/"\s*$/, "");
    const jsx = parts[1]
      .replace(/}\s*$/, "")
      .replace(/^\s*"/, "")
      .replace(/"\s*$/, "");
    parsed = {
      explanation,
      jsx,
    };
  }

  parsed["jsx"] = cleanJSX(parsed["jsx"]);

  console.log(parsed);

  return parsed;
}
