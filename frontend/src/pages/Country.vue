<template>
  <div class="min-h-screen bg-black text-white p-8">
    <div class="max-w-5xl mx-auto">

      <h1 class="text-5xl font-bold mb-4">
        Best {{ countryData.name }} Itinerary
      </h1>

      <p class="text-zinc-400 text-lg mb-10">
        AI generated travel plan for {{ countryData.name }}.
      </p>

      <div class="space-y-10">

        <div
          v-for="(day, index) in countryData.itinerary"
          :key="index"
          class="bg-zinc-900 p-6 rounded-3xl"
        >
          <h2 class="text-2xl font-bold mb-4">
            Day {{ index + 1 }} — {{ day.area }}
          </h2>

          <ul class="space-y-3 text-zinc-300">
            <li
              v-for="(activity, i) in day.activities"
              :key="i"
            >
              • {{ activity }}
            </li>
          </ul>
        </div>

      </div>

      <div class="mt-16 text-center">
        <a
          href="/"
          class="bg-cyan-500 text-black px-8 py-4 rounded-2xl font-bold inline-block"
        >
          ✈️ Generate Your AI Trip
        </a>
      </div>

    </div>
  </div>
</template>

<script>
import countries from '../data/countries';
import { useHead } from '@vueuse/head';

export default {
  computed: {
    slug() {
      return this.$route.params.slug;
    },

    countryData() {
      return countries[this.slug];
    }
  },
  mounted() {
    useHead({
        title: `Best ${this.countryData.name} Itinerary (2026)`,

        meta: [
        {
            name: 'description',
            content: `AI generated ${this.countryData.name} itinerary with attractions, restaurants and travel tips.`
        }
        ]
    });
    }
};
</script>