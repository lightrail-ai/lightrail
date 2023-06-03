import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { File } from "./storage";
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function cleanJSX(jsx: string) {
  let cleaned = jsx.replaceAll(" class=", " className=");
  cleaned = cleaned.replaceAll(" for=", " htmlFor=");
  cleaned = cleaned.replaceAll("</img>", "");
  cleaned = cleaned.replaceAll(/<img([^>/]*)>/g, "<img$1 />"); //replace img tags with self-closing tags, preserving attributes
  return cleaned;
}

export async function generateRoot(description: string): Promise<File[]> {
  const system = `
        You are a helpful assistant for a React developer.
        You are given a description, and you generate an array of React components in the JSON format described below:

        \`\`\`
        {
            "name": "...",   // The name of the component, as a string
            "dependencies": ["...", "..."],    // Other compoents that this component uses. List only the names of custom components
            "props": ["...", "..."],   // The props that this component uses
            "render": "...",    // The JSX for the component, as a string. Use only Tailwind CSS for styling. 
        }
        \`\`\`
  `;

  const initialPrompt = `

        Using this React Component serialization format: 

        \`\`\` 
        {
          "name": "...",   // The name of the component
          "dependencies": ["...", "..."],    // Other compoents that this component uses. List only the names of custom components
          "props": ["...", "..."],   // The props that this component uses
          "render": "...",    // The JSX for the component, as a string. Use only Tailwind CSS for styling. 
        }
        \`\`\`

        generate an array of React components (use Tailwind CSS) that fulfill this description:

        ${description}

        The first component should be called Index and should be the top-level component. Come up with the names for the components you'd need to implement to satisfy this description.
        This should include components that describe semantic sections of the output, as well as components that represent sepcific UI elements.
        Output this list of names in the "dependencies" key of the first component's JSON. The "dependencies" list should ONLY include component names, not any other functions or libraries.
        Then, using only these components and standard HTML elements, generate a React component tree (in JSX, using Tailwind CSS) that fulfills the description. Only provide the JSX for the top-level component, in the "render" key of the output JSON.
        Then, for each dependency component, follow the same process to generate a serialized JSON representation. Repeat until no dependencies are unimplemented. If a component requires props, provide those props with sample values whenever that component is used.
        When accessing props in the JSX, use the format \`props.propName\` to access the prop value. A component's children are available as \`props.children\`.

        Make sure ALL data is provided to each component whenever it is used, making up whatever data necessary, so that the component can be rendered without errors.

        Make sure to respond only with an array of JSON objects and no other content or text. Do not have any text before or after the JSON. Do not output any explanation.
        
        All JSX should be valid React JSX (i.e. use className for classes, every tag should be self-closing or have a closing tag, etc.)`;

  const folloupPrompt = (comp: string) => `
        Please use the same output format and rules as before to generate the JSX for the '${comp}' component that you described above. 
        Remember to include the names of any new components you need to implement in the "dependencies" key of the output JSON. No other dependencies should be included in the "dependencies" key. 
        Make sure the output is styled with Tailwind CSS to look modern and responsive. 

        Provide output in this JSON format: 

        \`\`\`
        {
            "dependencies": ["...", "..."],
            "jsx": "...",
        }
        \`\`\`
  `;

  let messages: ChatCompletionRequestMessage[] = [
    {
      role: "system",
      content: system,
    },
    {
      role: "user",
      content: initialPrompt,
    },
  ];

  let rawResponse = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0301",
    messages,
  });

  messages.push(rawResponse.data.choices[0].message!);

  const responseString = rawResponse.data.choices[0].message?.content!;

  let cleanedResponse = responseString
    .replace(/^[^\[]*\[/, "[")
    .replace(/\][^\]]*$/, "]");

  console.log(cleanedResponse);

  let response = JSON.parse(cleanedResponse);

  let files: File[] = response.map((comp: any) => ({
    path: comp.name === "Index" ? "index" : comp.name,
    contents: comp.render,
  }));

  console.log(files);
  return files;
}

export async function modifyComponent(old: string, modification: string) {
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

        
        
        Do not assume that any custom components exist that aren't already used; use only standard HTML elements in your changes. Return the result with no other comments outside of the JSON. Here's my request:
        
        \`\`\`
        {
          "jsx": "${old.replaceAll("\n", "\\n")}",
          "modification": "${modification}"
        }
        \`\`\`
        
        Respond only as a JSON object.`;

  const rawResponse = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0301",
    messages: [
      {
        role: "system",
        content: system,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const responseString = rawResponse.data.choices[0].message?.content!;

  console.log(responseString);
  const jsonResponse = responseString
    .replace(/^[^{]*{/, "{")
    .replace(/}[^}]*$/, "}");

  console.log(jsonResponse);

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
  return parsed;
}

export async function modifyComponentWithEdits(
  old: string,
  modification: string
) {
  const rawResponse = await openai.createEdit({
    model: "text-davinci-edit-001",
    input: old,
    instruction: modification,
  });

  const responseString = rawResponse.data.choices[0].text;

  console.log(responseString);

  return {
    jsx: responseString,
    explanation: "I tried my best to make the changes you asked for!",
  };
}

export async function modifyComponentWithCompletion(
  old: string,
  modification: string
) {
  const rawResponse = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `
    Modify the following JSX component tree to match this description / request: "${modification}".

    \`\`\`
    ${old}
    \`\`\`
    
    Present the modification as a JSON object with format {"explanation": "...", "jsx": "..."}, where the \`explanation\` explains the specific DOM/css-class changes made and why, and the \`jsx\` is the updated React component tree styled with Tailwind CSS classes, as a string.
    
    \`\`\`
    {
         "explanation": "`,
    max_tokens: 3000,
    stop: "```",
  });

  const responseString = rawResponse.data.choices[0].text;
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
