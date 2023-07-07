<button
  onClick={props.onClick}
  className={`transition duration-300 ease-in-out ${
    props.primary
      ? "bg-white text-black border hover:bg-opacity-80"
      : "bg-transparent text-white bg-opacity-0 border border-white hover:bg-white hover:bg-opacity-10 focus:bg-white-900 focus:text-white-900"
  } font-medium py-2 px-4 rounded-full`}
>
  {props.children}
</button>
