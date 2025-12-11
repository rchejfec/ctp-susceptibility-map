<script>
	/**
	 * Root Layout - CTP Susceptibility Map
	 *
	 * Simple layout for iframe embedding (no navigation)
	 */
	import '../app.css';
</script>

<div class="app-container">
	<slot />
</div>

<style>
	.app-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		overflow: hidden;
	}
</style>
