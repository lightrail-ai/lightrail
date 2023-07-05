<div className="overflow-x-hidden bg-zinc-950 text-zinc-200 w-full">
  <section className="relative py-12 sm:py-16 lg:pt-20">
      <div className="container px-8 mx-auto ">
        
        <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-none sm:text-5xl sm:leading-tight lg:text-6xl lg:leading-tight">
          {props.heading}
        </h1>
        <p className="max-w-md mt-6 text-base leading-7 font-inter">
          {props.subheading}
        </p>

        <div className="relative inline-flex mt-10 group mr-4">
          <div className="absolute transitiona-all duration-1000 opacity-70 -inset-px bg-gradient-to-r from-green-500 to-sky-500 rounded-xl blur-lg group-hover:opacity-100 group-hover:-inset-1 group-hover:duration-200 animate-tilt"></div>

          <a
            href="#"
            title=""
            className="relative inline-flex items-center justify-center transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            role="button"
          >
            <Button primary>{props.cta}</Button>
          </a>
          
        </div>
        <div className="inline-block py-2 text-base opacity-50">
          {props.tagline}
        </div>
      </div>
  </section>
</div>