<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";
	import { ScrollArea as ScrollAreaPrimitive } from "bits-ui";

	type Props = HTMLAttributes<HTMLDivElement> & { class?: string };

	let { class: className, ...rest }: Props = $props();
</script>

<ScrollAreaPrimitive.Root
	class={cn("relative overflow-hidden", className)}
	{...rest}
>
	<ScrollAreaPrimitive.Viewport class="h-full w-full rounded-[inherit]">
		<slot />
	</ScrollAreaPrimitive.Viewport>
	<ScrollAreaPrimitive.Scrollbar
		orientation="vertical"
		class="flex touch-none select-none p-px transition-colors"
	>
		<ScrollAreaPrimitive.Thumb class="relative flex-1 rounded-full bg-border" />
	</ScrollAreaPrimitive.Scrollbar>
</ScrollAreaPrimitive.Root>
