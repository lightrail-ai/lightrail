<div className="flex items-center justify-between p-4 bg-gray-50 shadow-md">
  <div className="text-gray-900 font-bold text-xl">{props.logo}</div>
  <nav className="flex items-center space-x-6">
    {props.links.map((link) => (
      <a
        href={link.url}
        className="text-gray-700 hover:text-indigo-600 hover:border-b-indigo-600 border-b-2 mb-1 transition-colors duration-300"
      >
        {link.text}
      </a>
    ))}
  </nav>
  {props.cta && (
    <button
      className="bg-indigo-600 text-gray-200 py-2 px-4 rounded-md"
      onClick={props.cta.onClick}
    >
      {props.cta.text}
    </button>
  )}
</div>
