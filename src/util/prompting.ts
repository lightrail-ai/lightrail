import { File } from "./storage";

import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAI } from "langchain/llms/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { Library } from "./starter-library";
import { SERVER_URL } from "./constants";

const chat = new ChatOpenAI({
  modelName: "gpt-3.5-turbo-0301",
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
  cleaned = cleaned.replaceAll("</img>", "");
  cleaned = cleaned.replaceAll(/<img([^>/]*)>/g, "<img$1 />"); //replace img tags with self-closing tags, preserving attributes
  cleaned = cleaned.replaceAll("</input>", "");
  cleaned = cleaned.replaceAll(/<input([^>/]*)>/g, "<input$1 />"); //replace input tags with self-closing tags, preserving attributes
  return cleaned;
}

const libraryForPrompt = Object.entries(Library)
  .map(
    ([name, details]) =>
      `${name}: ${details.description} (example usage: ${details.example})`
  )
  .join("\n");

type LibraryComponent = keyof typeof Library;

const libraryComponents = Object.keys(Library) as LibraryComponent[];

export async function generateRoot(
  description: string,
  streamingCallback?: (token: string) => void
): Promise<File[]> {
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

        generate an array of React components (use Tailwind CSS) that fulfill this description: "${description}"

        The first component should be called Index and should be the top-level component. Come up with the names for the components you'd need to implement to satisfy this description.
        This should include components that describe semantic sections of the output, as well as components that represent sepcific UI elements.
        Output this list of names in the "dependencies" key of the first component's JSON. The "dependencies" list should ONLY include component names, not any other functions or libraries.
        Then, using only these components and standard HTML elements (or the components listed below), generate a React component tree, in JSX (as a string) & styled with Tailwind CSS classes, that fulfills the description. Font Awesome icons are available to you, as css classes. Only provide the JSX for the top-level component, in the "render" key of the output JSON.
        Then, for each dependency component that isn't already implemented, follow the same process to generate a serialized JSON representation. Repeat until no dependencies are unimplemented. If a component requires props, provide those props with sample values whenever that component is used.
        When accessing props in the JSX, use the format \`props.propName\` to access the prop value. A component's children are available as \`props.children\`.

        The following components can also be used implementing them yourself, IF they are appropriate for the description requested:

        ${libraryForPrompt}

        ONLY use components from that list if they are appropriate for the description requested. You will be penalized for misusing them.  
        Make sure ALL data is provided to each component whenever it is used, making up whatever data necessary, so that the component can be rendered without errors.
        All JSX should be valid React JSX (i.e. use className for classes, every tag should be self-closing or have a closing tag, etc.)
        Respond only with an array of RFC-compliant JSON objects and no other content, comments, titles, explanations, or text.`;

  let messages = [
    new SystemChatMessage(system),
    new HumanChatMessage(initialPrompt),
  ];

  let rawResponse = await chat.call(messages, undefined, [
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

  let usedLibraryComponents = new Set<keyof typeof Library>();

  files = files.filter((file) => {
    if (libraryComponents.includes(file.path as LibraryComponent)) {
      return false;
    }

    for (const libComp of libraryComponents) {
      if (file.contents?.includes(`<${libComp}`)) {
        usedLibraryComponents.add(libComp);
      }
    }

    return true;
  });

  for (const libComp of Array.from(usedLibraryComponents)) {
    const contentsPath = Library[libComp].src;
    const resp = await fetch(
      SERVER_URL + "/starter-components/" + contentsPath
    );
    const contents = await resp.text();

    files.push({
      path: libComp,
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
    "render": "...",    // The JSX for the component, as a string. Use only Tailwind CSS for styling. Use only props requested in the description.
  }
  \`\`\`
  
`;

  const initialPrompt = `
  Generate a JSON-serialized React component for the provided name/props/description. For example, if given the input:

  Name: PriceDisplayBox
  Props: price, currency
  Description: A box that displays a price and currency on a gray background with rounded corners

  You produce:

  \`\`\`
  {
      "name": "PriceDisplayBox",   // The name of the component, as a string
      "props": ["price", "currency"],   // The props that this component uses
      "render": "<div className=\"bg-slate-200 px-2 py-1 rounded-md\">\\n  {props.price} ({props.currency})\\n</div>",    // The JSX for the component, as a one-line string. Use only Tailwind CSS for styling. 
  }
  \`\`\`

  The JSX you generate should only use Tailwind CSS for styling. Font Awesome icons are also available to you, as css classes.
  When accessing props in the JSX, use the format \`props.propName\` to access the prop value.
  A component's children are available as \`props.children\`.  All JSX should be valid React JSX (i.e. use className for classes, every tag should be self-closing or have a closing tag, etc.)

  ${description}

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

  let rawResponse = await chat.call(messages, undefined, [
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
  };
}

export async function modifyComponent(
  old: string,
  modification: string,
  streamingCallback?: (token: string) => void
) {
  const system = `
        You are a helpful JSON API for a React developer, and you modify React components to satisfy a given set of requirements.
        You use Tailwind CSS for all styling, and only manipulate the component's JSX component tree. 
        You receive requests in a standardized JSON format, and respond in a standardized JSON format that includes an explanation of your changes.`;
  const prompt = `
        I will give you the JSX component tree for a React component (as a string) as well as a description of a modification that needs to be made to the component, 
        and you will modify the component tree to satisfy the modification (using Tailwind CSS for styling) and return it along with an explanation of your changes.
        My request will be JSON with the keys "jsx" and "modification" (both strings), and your response should be JSON with the keys "explanation" (a string) and "jsx" (a string). For example: 

        My Request: 
        \`\`\`
        {
          "jsx": "<h1 className=\"text-md\">Hello, world!</h1>",
          "modification": "Make the text larger"
        }
        \`\`\`

        Your Response:
        \`\`\`
        {
          "explanation": "I added the Tailwind CSS class 'text-lg' to the h1 tag to make the text larger.",
          "jsx": "<h1 className=\"text-lg\">Hello, world!</h1>"
        }
        \`\`\`

        
        
        Do not assume that any custom components exist that aren't already used; use only standard HTML elements in your changes. 
        You can use Font Awesome icons, as CSS classes. Return the result with no other comments outside of the JSON. Here's my request:
        
        \`\`\`
        {
          "jsx": "${old.replaceAll("\n", "\\n")}",
          "modification": "${modification}"
        }
        \`\`\`
        
        Respond only as a JSON object.`;

  const rawResponse = await chat.call(
    [new SystemChatMessage(system), new HumanChatMessage(prompt)],
    undefined,
    [
      {
        handleLLMNewToken: streamingCallback,
      },
    ]
  );

  const responseString = rawResponse.text;

  console.log(responseString);
  const jsonResponse = responseString
    .replace(/^[^{]*{/, "{")
    .replace(/}[^}]*$/, "}");

  let parsed;

  try {
    parsed = JSON.parse(jsonResponse);
    if (!parsed.explanation || !parsed.jsx) {
      throw new Error("Invalid response");
    }
  } catch (e) {
    console.warn("JSON parse failed, constructing manually");
    const parts = jsonResponse
      .replace(/^([{"]|\s)*"explanation"\s*:\s*"/, "")
      .replace(/([}"]|\s)*$/, "")
      .split(/(?:[",]|\s)*"jsx"\s*:\s*"/);
    const explanation = parts[0];
    const jsx = parts[1];
    parsed = {
      explanation,
      jsx,
    };
  }

  parsed["jsx"] = cleanJSX(parsed["jsx"]);

  console.log(parsed);
  return parsed;
}

// export async function modifyComponentWithEdits(
//   old: string,
//   modification: string
// ) {
//   const rawResponse = await openai.createEdit({
//     model: "text-davinci-edit-001",
//     input: old,
//     instruction: modification,
//   });

//   const responseString = rawResponse.data.choices[0].text;

//   console.log(responseString);

//   return {
//     jsx: responseString,
//     explanation: "I tried my best to make the changes you asked for!",
//   };
// }

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
