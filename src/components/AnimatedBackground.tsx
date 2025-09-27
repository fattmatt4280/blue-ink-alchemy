const AnimatedBackground = () => {
  return (
    <>
      {/* Optimized background layer - reduced orbs for better performance */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" style={{ contain: 'layout style paint' }}>
        {/* Large floating orbs - reduced to 2 */}
        <div className="neon-orb large animate-float-2" style={{ top: '60%', right: '10%', willChange: 'transform' }} />
        <div className="neon-orb large animate-float-3" style={{ top: '80%', left: '70%', willChange: 'transform' }} />
        
        {/* Medium orbs - reduced to 3 */}
        <div className="neon-orb medium animate-float-5" style={{ top: '45%', left: '5%', willChange: 'transform' }} />
        <div className="neon-orb medium animate-float-6" style={{ top: '70%', right: '45%', willChange: 'transform' }} />
        <div className="neon-orb medium animate-float-1" style={{ top: '90%', left: '20%', willChange: 'transform' }} />
      </div>

      {/* Simplified mid-layer - reduced particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[5]" style={{ contain: 'layout style paint' }}>
        {/* Large floating orbs with reduced opacity for hero area */}
        <div className="neon-orb large animate-float-1 opacity-40" style={{ top: '10%', left: '15%', willChange: 'transform' }} />
        
        {/* Small orbs - reduced to 2 */}
        <div className="neon-orb small animate-float-2 opacity-30" style={{ top: '35%', left: '85%', willChange: 'transform' }} />
        <div className="neon-orb small animate-float-4 opacity-30" style={{ top: '15%', right: '40%', willChange: 'transform' }} />
      </div>
    </>
  );
};

export default AnimatedBackground;