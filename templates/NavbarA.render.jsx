<header className="bg-gradient-to-b from-zinc-900 to-zinc-950 p-3 flex justify-between items-center gap-3 font-light">
  <div className="text-slate-100 text-xl">{props.logo}</div>
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
    <Button primary size="sm">
      {props.cta.text}
    </Button>
  )}
</header>
