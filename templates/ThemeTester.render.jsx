<div>
    <section id="landing">
        <Navbar logo={'Nebula'} links={[ { url: '#features', text: 'Features' }, { url: '#testimonials', text: 'Testimonials' }, { url: '#contact', text: 'Contact', }, ]} cta={{ text: 'Sign Up', url: '/signup', }} />
        <Hero heading='Quality resources shared by the community' subheading='Access 100+ resources of all kinds, for one low monthly price' tagline='By Artists, For Artists' cta='Get Access Now!' />
        <SectionHeading heading='Features' subheading='Here are some of the features that make Nebula great.' />
        <FeatureGrid>
            <FeatureCard icon='fa-gear' heading='Amazing Feature' description='This feature will make your experience incredibly smooth and efficient.' />  <FeatureCard icon='fa-rocket' heading='Cool Feature' description='This feature is fun!' /> 
            <FeatureCard icon='fa-gear' heading='Amazing Feature' description='This feature will make your experience incredibly smooth and efficient.' />  <FeatureCard icon='fa-rocket' heading='Cool Feature' description='This feature is fun!' />
        </FeatureGrid>
        <CTASection cta="Install Now" heading="Ready to dive in?" subheading="Join our community today." callouts={["Open-Source", "Free Forever"]} />
    </section>
    <section id="dashboard">
        <Grid>
            <Card heading="DAUs" subheading="Daily Active Users"><Chart type='bar' series={[{data: [{x: 'Jan', y: 100}, {x: 'Feb', y: 200}, {x: 'Mar', y: 300}]}]} options={{xaxis: {type: 'category'}}} width={350}/></Card>
            <Card heading="DAUs" subheading="Daily Active Users"><Chart type='bar' series={[{data: [{x: 'Jan', y: 100}, {x: 'Feb', y: 200}, {x: 'Mar', y: 300}]}]} options={{xaxis: {type: 'category'}}} width={350}/></Card>
            <Card heading="DAUs" subheading="Daily Active Users"><Chart type='bar' series={[{data: [{x: 'Jan', y: 100}, {x: 'Feb', y: 200}, {x: 'Mar', y: 300}]}]} options={{xaxis: {type: 'category'}}} width={350}/></Card>
            <Card heading="DAUs" subheading="Daily Active Users"><Chart type='bar' series={[{data: [{x: 'Jan', y: 100}, {x: 'Feb', y: 200}, {x: 'Mar', y: 300}]}]} options={{xaxis: {type: 'category'}}} width={350}/></Card>
            <Card heading="DAUs" subheading="Daily Active Users"><Chart type='bar' series={[{data: [{x: 'Jan', y: 100}, {x: 'Feb', y: 200}, {x: 'Mar', y: 300}]}]} options={{xaxis: {type: 'category'}}} width={350}/></Card>
            <Card heading="DAUs" subheading="Daily Active Users"><div className="text-4xl text-center">12</div></Card>
            <Card heading="DAUs" subheading="Daily Active Users"><Chart type='bar' series={[{data: [{x: 'Jan', y: 100}, {x: 'Feb', y: 200}, {x: 'Mar', y: 300}]}]} options={{xaxis: {type: 'category'}}} width={350}/></Card>
            <Card heading="DAUs" subheading="Daily Active Users"><Chart type='bar' series={[{data: [{x: 'Jan', y: 100}, {x: 'Feb', y: 200}, {x: 'Mar', y: 300}]}]} options={{xaxis: {type: 'category'}}} width={350}/></Card>
        </Grid>
    </section>
</div>