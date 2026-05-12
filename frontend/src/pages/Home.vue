<template>
  <div class="min-h-screen bg-zinc-950 text-white selection:bg-cyan-500/30">
    <div class="border-b border-zinc-800 bg-gradient-to-r from-zinc-900 to-zinc-950 sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-5 sm:px-6 py-6 md:py-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl md:text-5xl font-bold tracking-tighter flex items-center gap-3">
            🌍 <span class="bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400">AI Travel Planner</span>
          </h1>
          <p class="text-zinc-500 mt-1 text-base md:text-lg font-medium">
            Smart itineraries • Real-world data
          </p>
        </div>
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-5 sm:px-6 py-10 md:py-16">
      <div class="bg-zinc-900/90 backdrop-blur-2xl border border-zinc-700/50 rounded-[2rem] p-7 md:p-12 shadow-2xl">
        <div class="text-center mb-10 md:mb-14">
          <h2 class="text-3xl md:text-4xl font-bold mb-3">Plan Your Dream Trip</h2>
          <p class="text-zinc-400 text-lg">Where should the AI take you next?</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
          <div class="md:col-span-7">
            <label class="block text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3 ml-1">Destination Country</label>
            <input
              v-model="country"
              placeholder="e.g. Japan, France, Italy..."
              class="input"
            />
          </div>

          <div class="md:col-span-5">
            <label class="block text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3 ml-1">Start Date</label>
            <input
              ref="startDateInput"
              type="date"
              v-model="startDate"
              @click="openDatePicker"
              class="input cursor-pointer"
            />
          </div>

          <div class="md:col-span-12">
            <label class="block text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3 ml-1">
              Specific Places (Optional)
            </label>
            <textarea
              v-model="placesText"
              placeholder="Tokyo, Kyoto, Osaka Castle, Shibuya..."
              rows="3"
              class="input resize-none min-h-[120px]"
            ></textarea>
          </div>
        </div>

        <p class="text-sm text-zinc-400 mb-3">
          Free usage today: {{ remaining }}/5
        </p>

        <button
          @click="generateTrip"
          :disabled="loading || !country.trim()"
          class="btn w-full mt-10 py-6 text-xl font-bold flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading" class="flex items-center gap-3">
            <svg class="animate-spin h-6 w-6 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Planning...
          </span>
          <span v-else>Generate My Itinerary ✨</span>
        </button>
      </div>

      <div v-if="loading" class="text-center mt-20">
        <div class="inline-flex flex-col items-center gap-6">
          <div class="w-20 h-20 border-4 border-zinc-800 border-t-cyan-400 rounded-full animate-spin"></div>
          <p class="text-2xl font-medium text-zinc-400 animate-pulse">AI is crafting your adventure...</p>
        </div>
      </div>

      <div v-if="trip" class="mt-20" id="trip-result">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h2 class="text-5xl md:text-7xl font-black tracking-tighter text-white">{{ trip.destination }}</h2>
            <p class="text-cyan-400 mt-3 text-xl md:text-2xl font-medium">
              {{ trip.days || trip.plan?.length }} Day Journey • Starting {{ trip.plan?.[0]?.date || 'Soon' }}
            </p>
          </div>
          <p class="text-xs text-zinc-500 mb-2">
              Live cheapest routes from global airlines
            </p>
          <div class="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <a v-if="trip.flightLink" 
              :href="`https://ai-travel-agent-lnul.onrender.com/go?type=flight&country=${country}&url=${encodeURIComponent(trip.flightLink)}`"
              target="_blank" 
              class="bg-blue-600 hover:bg-blue-500 py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all">
              🔥 Compare Cheapest Flights Now
            </a>
            <button @click="translateTrip('zh')" class="btn-secondary py-4 px-4 rounded-2xl font-bold">
              🌏 中文
            </button>

            <button @click="translateTrip('en')" class="btn-secondary py-4 px-4 rounded-2xl font-bold">
              🇺🇸 EN
            </button>
            <button @click="clearTrip" class="text-zinc-500 hover:text-white transition-colors text-lg font-medium py-2">
              New Trip →
            </button>
          </div>
        </div>

        <div class="space-y-12">
          <div v-for="day in trip.plan" :key="day.day" class="card">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-zinc-800/50 pb-8">
              <div class="flex items-center gap-6">
                <div class="text-6xl md:text-7xl font-black text-cyan-500/80">0{{ day.day }}</div>
                <div>
                  <div class="text-2xl font-bold text-white">{{ day.date }}</div>
                  <div class="text-zinc-400 text-lg">{{ day.area }}</div>
                </div>
              </div>
              <div class="inline-flex items-center gap-3 bg-zinc-800/50 px-5 py-2 rounded-full border border-zinc-700/50">
                <span class="text-2xl">🌤</span>
                <span class="font-bold text-lg">{{ day.weather || "Clear Skies" }}</span>
              </div>
            </div>

            <div class="mb-10">
              <h4 class="section-title">📍 Daily Activities</h4>
              <ul class="space-y-6 mt-6">
                <li v-for="(activity, i) in day.activities" :key="i"
                    class="flex gap-5 text-xl pl-5 border-l-4 border-cyan-500/20 py-1">
                  <span class="text-cyan-400 font-black">{{ i + 1 }}</span>
                  <span class="text-zinc-200">{{ activity }}</span>
                </li>
              </ul>
            </div>

            <div v-if="day.transport?.length" class="mb-10 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
              <h4 class="section-title text-base uppercase tracking-widest opacity-60">🚆 Transit Plan</h4>
              <div class="mt-4 space-y-3 text-zinc-300 font-medium text-lg">
                <div v-for="(t, i) in day.transport" :key="i" class="flex items-center gap-3">
                  <span class="text-cyan-500">→</span> {{ t }}
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div v-if="day.restaurants?.length" class="sm:col-span-2 lg:col-span-3 mt-4">
                  <h4 class="section-title mb-6">🍜 Recommended Dining</h4>
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div v-for="r in day.restaurants" :key="r.name" class="place-card group flex flex-col h-full">
                      <div class="flex-1">
                        <div class="font-bold text-xl group-hover:text-cyan-400 transition-colors">{{ r.name }}</div>
                        <div class="text-yellow-500 font-bold mt-1">★ {{ r.rating }}</div>
                        <div class="text-sm text-zinc-500 mt-4 leading-relaxed italic">{{ r.address }}</div>
                      </div>
                      
                      <a :href="`https://ai-travel-agent-lnul.onrender.com/go?url=${encodeURIComponent(r.links.google)}&type=restaurant&source=google&country=${country}`"
                        target="_blank" 
                        class="money-btn mt-6 !bg-zinc-800 !text-zinc-300 border-zinc-700">
                        😋 Reserve Popular Local Restaurant
                      </a>
                    </div>
                  </div>
                </div>

                <div v-if="day.hotels?.length" class="sm:col-span-2 lg:col-span-3 mt-8">
                  <h4 class="section-title mb-6">🏨 Stay At</h4>
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div v-for="h in day.hotels" :key="h.name" class="place-card group flex flex-col h-full">
                      <div class="flex-1">
                        <div class="font-bold text-xl group-hover:text-cyan-400 transition-colors">{{ h.name }}</div>
                        <div class="text-yellow-500 font-bold mt-1">★ {{ h.rating }}</div>
                        <div class="text-sm text-zinc-500 mt-4 leading-relaxed italic">{{ h.address }}</div>
                      </div>
                      <p class="text-xs text-zinc-500 mb-2">
                        Best deals curated for your itinerary
                      </p>
                      <a :href="`https://ai-travel-agent-lnul.onrender.com/go?url=${encodeURIComponent(h.links.klook)}&type=activity&source=klook&country=${country}&place=${encodeURIComponent(h.name)}`"
                        target="_blank" 
                        class="money-btn mt-6">
                        🏨 Book Best Value Hotel in Area
                      </a>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>

        <div v-if="trip.tips?.length" class="mt-16 bg-gradient-to-br from-zinc-900 to-black border border-zinc-700/50 p-10 md:p-14 rounded-[3rem]">
          <h3 class="text-3xl font-bold mb-10 flex items-center gap-4">
            <span class="bg-cyan-500 p-2 rounded-lg text-black text-sm">PRO</span> Travel Tips
          </h3>
          <ul class="grid md:grid-cols-2 gap-x-12 gap-y-6 text-zinc-300 text-lg">
            <li v-for="(tip, i) in trip.tips" :key="i" class="flex gap-4">
              <span class="text-cyan-500 font-bold">●</span> {{ tip }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  data() {
    return {
      country: "",
      placesText: "",
      startDate: "",
      trip: null,
      loading: false,
      originalTrip: null,
      remaining: 5,
    };
  },

  methods: {
    async generateTrip() {
      if (!this.country.trim()) {
        alert("Please enter a destination country");
        return;
      }

      this.loading = true;
      this.trip = null;

      const placesArray = this.placesText.trim()
        ? this.placesText.split(",").map(p => p.trim()).filter(Boolean)
        : [];

      try {
        const res = await fetch("https://ai-travel-agent-lnul.onrender.com/api/generate-trip", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            country: this.country,
            places: placesArray,
            startDate: this.startDate,
          }),
        });

        const data = await res.json();

        if (data.success) {
          this.trip = data.trip;
          this.originalTrip = JSON.parse(JSON.stringify(data.trip));
          this.remaining--;
        } else {
          alert(data.error || "Failed to generate trip");
        }
      } catch (err) {
        console.error(err);
        alert("Cannot connect to server. Ensure backend is running.");
      }

      this.loading = false;
    },

    openDatePicker() {
      const input = this.$refs.startDateInput;
      if (input?.showPicker) input.showPicker();
      else input?.focus();
    },

    clearTrip() {
      if (confirm("Start a new trip?")) this.trip = null;
    },
    async translateTrip(lang) {
      if (!this.originalTrip) return;

      this.loading = true;

      try {
        const res = await fetch("https://ai-travel-agent-lnul.onrender.com/api/translate-trip", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            trip: this.originalTrip,
            lang
          }),
        });

        const data = await res.json();

        if (data.success) {
          this.trip = data.trip;
        }

      } catch (err) {
        console.error(err);
        alert("Translation failed");
      }

      this.loading = false;
    }
  }
};
</script>

<style scoped>
/* Base Input Styles */
.input {
  width: 100%;
  padding: 18px 24px;
  background: #101014;
  border: 2px solid #27272a;
  border-radius: 20px;
  color: white;
  font-size: 1.1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
}

.input:focus {
  outline: none;
  border-color: #22d3ee;
  background: #15151a;
  box-shadow: 0 0 0 5px rgba(34, 211, 238, 0.1);
}

/* Button Styles */
.btn {
  background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%);
  color: #083344;
  border-radius: 20px;
  box-shadow: 0 10px 25px -5px rgba(6, 182, 212, 0.4);
  transition: all 0.4s;
}

.btn:hover:not(:disabled) {
  transform: translateY(-4px);
  box-shadow: 0 20px 35px -5px rgba(6, 182, 212, 0.5);
}

.btn-secondary {
  background: #27272a;
  color: white;
  border: 1px solid #3f3f46;
  transition: all 0.3s;
}

.btn-secondary:hover {
  background: #3f3f46;
}

/* Card Styles */
.card {
  background: #121217;
  padding: 40px 30px;
  border-radius: 2.5rem;
  border: 1px solid #27272a;
}

.section-title {
  color: #67e8f9;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.place-card {
  background: #1c1c22;
  padding: 24px;
  border-radius: 22px;
  border: 1px solid #2d2d35;
  height: 100%;
}

.money-btn {
  display: block;
  text-align: center;
  padding: 12px;
  background: rgba(34, 211, 238, 0.1);
  color: #22d3ee;
  border: 1px solid rgba(34, 211, 238, 0.2);
  border-radius: 12px;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 1px;
  transition: all 0.3s;
}

.money-btn:hover {
  background: #22d3ee;
  color: black;
  transform: scale(1.02);
}

/* 📱 MOBILE RESPONSIVE OVERRIDES */
@media (max-width: 768px) {
  .max-w-6xl {
    padding-top: 1.5rem !important;
  }

  /* Form spacing */
  .p-7 {
    padding: 2rem 1.25rem !important;
  }

  /* Jumbo Mobile Inputs */
  .input {
    font-size: 1.25rem !important;
    padding: 20px !important;
    border-radius: 18px !important;
  }

  input[type="date"] {
    min-height: 68px;
  }

  /* Jumbo Mobile Button */
  .btn {
    padding: 24px !important;
    font-size: 1.35rem !important;
    border-radius: 24px !important;
  }

  /* Results Sizing */
  #trip-result h2 {
    font-size: 3rem !important;
    line-height: 1;
  }

  /* Day Card Sizing */
  .card {
    padding: 30px 20px !important;
    border-radius: 1.5rem !important;
  }

  .text-6xl {
    font-size: 4.5rem !important;
  }

  .section-title {
    font-size: 1.75rem !important;
  }

  li {
    font-size: 1.2rem !important;
    line-height: 1.5;
  }
}
</style>