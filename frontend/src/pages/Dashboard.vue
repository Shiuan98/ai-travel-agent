<template>
  <div class="min-h-screen bg-zinc-950 text-white p-8">
    <h1 class="text-3xl font-bold mb-6">📊 Affiliate Tracking Dashboard</h1>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
      <div class="card">
        <p class="text-zinc-400">Total Clicks</p>
        <h2 class="text-3xl font-bold">{{ stats.total }}</h2>
      </div>

      <div class="card">
        <p class="text-zinc-400">✈️ Flights</p>
        <h2 class="text-2xl font-bold">{{ stats.flight }}</h2>
      </div>

      <div class="card">
        <p class="text-zinc-400">🏨 Hotels</p>
        <h2 class="text-2xl font-bold">{{ stats.hotel }}</h2>
      </div>

      <div class="card">
        <p class="text-zinc-400">🍜 Restaurants</p>
        <h2 class="text-2xl font-bold">{{ stats.restaurant }}</h2>
      </div>
    </div>

    <!-- Country Breakdown -->
    <div class="card">
      <h2 class="text-xl font-bold mb-4">🌍 Clicks by Country</h2>

      <div v-for="(value, key) in stats.byCountry" :key="key" class="flex justify-between py-2 border-b border-zinc-800">
        <span class="capitalize">{{ key }}</span>
        <span class="text-cyan-400 font-bold">{{ value }}</span>
      </div>
    </div>

    <button @click="loadStats" class="mt-6 px-6 py-3 bg-cyan-500 text-black rounded-xl font-bold">
      Refresh
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      stats: {
        total: 0,
        hotel: 0,
        flight: 0,
        restaurant: 0,
        byCountry: {}
      }
    };
  },

  mounted() {
    this.loadStats();
  },

  methods: {
    async loadStats() {
      const res = await fetch("https://ai-travel-agent-m6hzd85rf-chen-woei-shiuan-s-projects.vercel.app/stats");
      this.stats = await res.json();
    }
  }
};
</script>

<style scoped>
.card {
  background: #18181b;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid #27272a;
}
</style>