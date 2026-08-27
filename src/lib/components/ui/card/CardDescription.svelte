<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";

	type Props = HTMLAttributes<HTMLParagraphElement> & { class?: string };

	let { class: className, ...rest }: Props = $props();
</script>

<p class={cn("text-sm text-muted-foreground", className)} {...rest}>
	<slot />
</p>
