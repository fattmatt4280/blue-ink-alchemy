const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Large floating orbs */}
      <div className="neon-orb large animate-float-1" style={{ top: '10%', left: '15%' }} />
      <div className="neon-orb large animate-float-2" style={{ top: '60%', right: '10%' }} />
      <div className="neon-orb large animate-float-3" style={{ top: '80%', left: '70%' }} />
      
      {/* Medium orbs */}
      <div className="neon-orb medium animate-float-4" style={{ top: '25%', right: '25%' }} />
      <div className="neon-orb medium animate-float-5" style={{ top: '45%', left: '5%' }} />
      <div className="neon-orb medium animate-float-6" style={{ top: '70%', right: '45%' }} />
      <div className="neon-orb medium animate-float-1" style={{ top: '90%', left: '20%' }} />
      
      {/* Small orbs */}
      <div className="neon-orb small animate-float-2" style={{ top: '35%', left: '85%' }} />
      <div className="neon-orb small animate-float-3" style={{ top: '55%', left: '40%' }} />
      <div className="neon-orb small animate-float-4" style={{ top: '15%', right: '40%' }} />
      <div className="neon-orb small animate-float-5" style={{ top: '75%', left: '55%' }} />
      <div className="neon-orb small animate-float-6" style={{ top: '95%', right: '60%' }} />
      <div className="neon-orb small animate-float-1" style={{ top: '5%', left: '45%' }} />
      
      {/* Tiny particles */}
      <div className="neon-particle animate-drift-1" style={{ top: '20%', left: '30%' }} />
      <div className="neon-particle animate-drift-2" style={{ top: '40%', right: '20%' }} />
      <div className="neon-particle animate-drift-3" style={{ top: '65%', left: '80%' }} />
      <div className="neon-particle animate-drift-4" style={{ top: '85%', right: '30%' }} />
      <div className="neon-particle animate-drift-5" style={{ top: '30%', left: '10%' }} />
      <div className="neon-particle animate-drift-6" style={{ top: '50%', right: '70%' }} />
    </div>
  );
};

export default AnimatedBackground;