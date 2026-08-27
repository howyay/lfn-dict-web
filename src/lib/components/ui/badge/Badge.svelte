<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";

	type Variant = "default" | "secondary" | "destructive" | "outline";

	type Props = HTMLAttributes<HTMLSpanElement> & {
		variant?: Variant;
		class?: string;
	};

	let { class: className, variant = "default", ...rest }: Props = $props();

	const styles: Record<Variant, string> = {
		default:
			"border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/80",
		secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
		destructive:
			"border-transparent bg-destructive text-white shadow-sm hover:bg-destructive/80",
		outline: "text-foreground"
	};
</script>

<span
	class={cn(
		"inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
		styles[variant],
		className
	)}
	{...rest}
>
	<slot />
</span>
