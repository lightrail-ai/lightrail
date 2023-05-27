import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { File } from "./storage";
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

function parseJsonResponse(response: any, fallback?: any) {
  const responseString = response.data.choices[0].message?.content!;

  console.log(responseString);

  let cleanedResponse = responseString
    .replace(/^[^{]*{/, "{")
    .replace(/}[^}]*$/, "}");

  let val;
  try {
    val = JSON.parse(cleanedResponse);
  } catch (e) {
    console.log(e);
    val = fallback;
  }

  return val;
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

        Make sure to respond only with an array of JSON objects and no other content or text. Do not have any text before or after the JSON. Do not output any explanation. `;

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
        You are a helpful assistant for a React developer.
        You are given a React component tree (in JSX, using Tailwind CSS) and a description of a modification to make. 
        You make the modification, explain the changes you made and return a new JSX component tree.
        
        You respond with JSON of the form:
        \`\`\`
        {
            "explanation": "...",
            "jsx": "..."
        }
        \`\`\`
        
        Where the value of \`jsx\` is the new JSX component tree (still using Tailwind for styling) and nothing else, 
        and the value of \`explanation\` is a description of the changes you made and why you made them.

        Only respond with the JSON, and no other text content. 
        
        Be very thorough in your explanation, and make sure to explain the changes you made.`;
  const prompt = `
        Modify this React component tree (in JSX, styled with Tailwind CSS): 

        \`\`\`
        ${old}
        \`\`\`

        To satisfy this modification:

        ${modification}
        
        Do not assume that any custom components exist that aren't already used; use only standard HTML elements in your changes. Make sure to respond only with JSON and no other content or text. Do not output the explanation outside of the JSON. Do not have any text before or after the JSON. `;
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
  const cleanedResponse = responseString
    .replace(/^[^{]*{/, "{")
    .replace(/}[^}]*$/, "}");

  const response = JSON.parse(cleanedResponse);

  return response;
}
