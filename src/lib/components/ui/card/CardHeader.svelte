<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";

	type Props = HTMLAttributes<HTMLDivElement> & { class?: string };

	let { class: className, ...rest }: Props = $props();
</script>

<div class={cn("flex flex-col space-y-1.5 p-6", className)} {...rest}>
	<slot />
</div>
