<div className="rounded-lg p-4 m-4 border shadow-lg">
    {props.heading && (
        <>
            <div className="font-semibold text-xl">{props.heading}</div>
            <div className="opacity-50 text-base pb-2">{props.subheading}</div>
        </>
    )}
    {props.children}
</div>