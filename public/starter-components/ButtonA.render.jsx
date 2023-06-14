<button
    title=""
    className={`inline-flex items-center px-6 py-4 font-semibold transition-all duration-200 rounded-lg ${props.primary ? "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700" : "bg-transparent text-blue-600 outline outline-blue-600 hover:bg-gray-100 focus:bg-gray-100"} `}
    role="button"
>
    {props.children}
    <i className="fas fa-arrow-right ml-2"></i>
</button>