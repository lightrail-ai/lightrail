<div className="py-12 text-center w-full {{{theme.style === 'holly' ? 'bg-zinc-950 text-zinc-200' : 'bg-white text-zinc-900' }}}">
  <h2 className="text-5xl font-bold">{props.heading}</h2>
  <p className="text-xl text-gray-700 my-8">{props.subheading}</p>
  <div className="flex justify-center items-center mb-6 gap-4">
    {props.callouts &&
      props.callouts.map((callout) => (
        <div className="flex items-center text-gray-400">
          <i className="fas fa-check-circle mr-2"></i>
          <p className="text-lg">{callout}</p>
        </div>
      ))}
  </div>
  <Button primary>    
    <span className="text-lg mr-2">{props.cta}</span>
    <i className="fas fa-arrow-right ml-2 animate-pulse"></i>
  </Button>
</div>
