<div className="bg-zinc-950 m-12 rounded-xl text-slate-200 py-12 text-center">
  <h2 className="text-5xl font-bold">{props.heading}</h2>
  <p className="text-xl text-slate-300 my-8">{props.subheading}</p>
  <div className="flex justify-center items-center mb-6 gap-4">
    {props.callouts &&
      props.callouts.map((callout) => (
        <div className="flex items-center text-slate-500">
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
