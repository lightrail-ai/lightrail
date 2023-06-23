<div className="bg-white py-12 text-center w-full">
  <h2 className="text-5xl font-bold mb-4">{props.heading}</h2>
  <p className="text-xl text-gray-700 mb-4">{props.subheading}</p>
  <div className="flex justify-center items-center mb-6 gap-4">
    {props.callouts &&
      props.callouts.map((callout) => (
        <div className="flex items-center text-gray-400">
          <i className="fas fa-check-circle mr-2"></i>
          <p className="text-lg">{callout}</p>
        </div>
      ))}
  </div>
  <button className="bg-blue-600 text-white hover:bg-blue-700 font-bold py-4 px-8 rounded-lg shadow-md inline-flex items-center transition duration-300 ease-in-out">
    <span className="text-lg mr-2">{props.cta}</span>
    <i className="fas fa-arrow-right ml-2 animate-pulse"></i>
  </button>
</div>
