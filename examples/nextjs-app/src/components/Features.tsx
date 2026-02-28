export function Features() {
  const features = [
    {
      title: 'Visual Regression Detection',
      description:
        'Automatically detect unintended UI changes across your application.'
    },
    {
      title: 'AI-Powered Analysis',
      description:
        'Smart analysis that understands context, not just pixel differences.'
    },
    {
      title: 'Seamless Integration',
      description:
        'Works with your existing GitHub workflow. No SDK or code changes required.'
    }
  ]

  return (
    <section className="features" id="features">
      {features.map((feature, index) => (
        <div key={index} className="feature-card">
          <h3>{feature.title}</h3>
          <p>{feature.description}</p>
        </div>
      ))}
    </section>
  )
}
