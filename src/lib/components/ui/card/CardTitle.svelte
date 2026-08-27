<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";

	type Props = HTMLAttributes<HTMLHeadingElement> & { class?: string };

	let { class: className, ...rest }: Props = $props();
</script>

<h3 class={cn("font-semibold leading-none tracking-tight", className)} {...rest}>
	<slot />
</h3>
