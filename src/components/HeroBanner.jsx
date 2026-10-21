import { useEffect, useState } from "react";

const SLIDES = [
    { title: "Great deals on top picks", text: "Shop popular products at prices you'll love", bg: "linear-gradient(120deg,#2874f0,#6a9cf7)" },
    { title: "Fast & free delivery", text: "Get your order delivered right to your door", bg: "linear-gradient(120deg,#fb641b,#ff9f00)" },
    { title: "Fresh arrivals every week", text: "Be the first to explore what's new", bg: "linear-gradient(120deg,#1b8a5a,#52c98f)" }
];

function HeroBanner() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(
            () => setIndex((i) => (i + 1) % SLIDES.length),
            4000
        );
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="hero-banner" aria-label="Promotions">
            <div
                className="hero-track"
                style={{ transform: `translateX(-${index * 100}%)` }}
            >
                {SLIDES.map((s) => (
                    <div className="hero-slide" key={s.title} style={{ background: s.bg }}>
                        <h2>{s.title}</h2>
                        <p>{s.text}</p>
                    </div>
                ))}
            </div>
            <div className="hero-dots">
                {SLIDES.map((s, i) => (
                    <button
                        key={s.title}
                        type="button"
                        aria-label={`Slide ${i + 1}`}
                        className={i === index ? "active" : ""}
                        onClick={() => setIndex(i)}
                    />
                ))}
            </div>
        </section>
    );
}

export default HeroBanner;
