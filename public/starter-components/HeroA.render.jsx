<div className={`bg-gradient-to-b ${props.bgGradient || "from-green-950 to-black"}`}>
  <section className="pt-24 pb-24 sm:pt-32 sm:pb-16 lg:pb-24">
    <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 relative z-20">
      <div className="max-w-xl mx-auto text-center">
        <h1 className="text-4xl font-bold sm:text-6xl">
          <span className={`text-transparent bg-clip-text bg-gradient-to-r ${props.textGradient || "from-green-300 to-white"}`}>
            {props.heading}
          </span>
        </h1>
        <p className={`mt-5 text-base sm:text-xl text-gray-400`}>
          {props.subheading}
        </p>

        <a
          href="#"
          title=""
          className="inline-flex items-center px-6 py-4 mt-8 font-semibold text-white transition-all duration-200 bg-blue-600 rounded-lg sm:mt-16 hover:bg-blue-700 focus:bg-blue-700"
          role="button"
        >
          {props.cta}
         <i className="fas fa-arrow-right ml-2"></i>
        </a>
      </div>
    </div>
  </section>
</div>
