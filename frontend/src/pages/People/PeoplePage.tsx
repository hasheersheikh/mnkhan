import { useState, useEffect } from "react";
import * as peopleApi from "../../api/people";

const PeoplePage: React.FC = () => {
  const [people, setPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        console.log("[PeoplePage] Fetching professional profiles...");
        const res = await peopleApi.getPeople();
        if (res.data.success) {
          setPeople(res.data.people);
        }
      } catch (err) {
        console.error("Error fetching people:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPeople();
  }, []);

  return (
    <div className="bg-white min-h-screen pb-20 md:pb-32">
      {/* Hero Section */}
      <section className="bg-mnkhan-charcoal py-16 md:py-24 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif italic mb-6">
            Our People.
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed">
            The strength of MNKHAN lies in our interdisciplinary team of legal
            experts, driven by a commitment to excellence and client success.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-mnkhan-orange/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
      </section>

      {/* People Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 -mt-10 md:-mt-16 relative z-20">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-mnkhan-orange border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {people.map((person, index) => (
              <div
                key={index}
                className="bg-white border border-mnkhan-gray-border p-8 md:p-12 shadow-sm hover:shadow-2xl transition-all duration-500 rounded-sm group animate-in fade-in slide-in-from-bottom-4 duration-700"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-mnkhan-charcoal text-white flex items-center justify-center text-xl md:text-2xl font-serif italic mb-6 md:mb-8 group-hover:bg-mnkhan-orange transition-colors">
                  {person.initials ||
                    person.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">
                  {person.name}
                </h2>
                <p className="text-mnkhan-orange font-bold uppercase tracking-widest text-[10px] md:text-xs mb-6">
                  {person.title}
                </p>

                <div className="space-y-4 md:space-y-6">
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted mb-2">
                      Expertise
                    </h3>
                    <p className="text-mnkhan-charcoal font-medium text-xs md:text-sm leading-relaxed">
                      {person.expertise}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-mnkhan-text-muted mb-2">
                      Background
                    </h3>
                    <p className="text-mnkhan-text-muted text-xs md:text-sm leading-relaxed">
                      {person.bio}
                    </p>
                  </div>
                </div>

                <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-mnkhan-gray-border text-center sm:text-left">
                  <button className="text-xs font-bold uppercase tracking-widest text-mnkhan-charcoal hover:text-mnkhan-orange transition-colors">
                    Contact Profile →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Philosophy Section */}
      <section className="max-w-4xl mx-auto px-6 md:px-8 mt-24 md:mt-40">
        <div className="text-center">
          <h2 className="text-[10px] md:text-sm font-bold uppercase tracking-[0.3em] text-mnkhan-orange mb-6 md:mb-8">
            Professional Philosophy
          </h2>
          <p className="text-xl md:text-3xl font-serif italic text-mnkhan-charcoal leading-relaxed">
            "We believe that legal counsel should be proactive, not reactive.
            Our team is built on the pillars of transparency, speed, and
            absolute commitment to our clients' commercial goals."
          </p>
        </div>
      </section>
    </div>
  );
};

export default PeoplePage;
