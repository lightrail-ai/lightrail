<header className="bg-gradient-to-b from-slate-800 to-slate-900 p-3 flex justify-between items-center gap-3">
  <div className="text-slate-100 font-bold text-xl">{props.logo}</div>
  <div className="flex-1" />
  <nav>
    <ul className="flex space-x-2">
      {props.links.map((link) => (
        <li key={link.url}>
          <a
            href={link.url}
            className="text-slate-100 hover:bg-slate-100 hover:bg-opacity-10 px-2 py-1 hover:rounded-full"
          >
            {link.text}
          </a>
        </li>
      ))}
    </ul>
  </nav>
  {props.cta && (
    <button className="bg-slate-100 text-slate-800 hover:bg-opacity-90 rounded-full px-4 py-2">
      {props.cta.text}
    </button>
  )}
</header>
