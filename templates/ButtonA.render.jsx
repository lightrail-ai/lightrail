<button
    title=""
    onClick={props.onClick}
    className={`inline-flex items-center ${props.size == "sm" ? "py-2 px-4" : "px-6 py-4"} font-semibold transition-all duration-200 rounded-lg ${props.primary ? "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700" : "bg-transparent text-blue-600 outline outline-blue-600 hover:bg-gray-100 focus:bg-gray-100"} `}
    role="button"
>
    {props.children}
</button>