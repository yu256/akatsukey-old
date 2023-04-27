<template>
<div ref="rootEl" v-size="{ max: [380] }" class="ukygtjoj _panel" :class="{ naked, thin, hideHeader: !showHeader, scrollable, closed: !showBody }">
	<header v-if="showHeader" ref="headerEl">
		<div class="title"><slot name="header"></slot></div>
		<div class="sub">
			<slot name="func"></slot>
			<button v-if="foldable" class="_button" @click="() => showBody = !showBody">
				<template v-if="showBody"><i class="ti ti-chevron-up"></i></template>
				<template v-else><i class="ti ti-chevron-down"></i></template>
			</button>
		</div>
	</header>
	<Transition
		:name="$store.state.animation ? 'container-toggle' : ''"
		@enter="enter"
		@after-enter="afterEnter"
		@leave="leave"
		@after-leave="afterLeave"
	>
		<div v-show="showBody" ref="contentEl" class="content" :class="{ omitted }">
			<slot></slot>
			<button v-if="omitted" class="fade _button" @click="() => { ignoreOmit = true; omitted = false; }">
				<span>{{ $ts.showMore }}</span>
			</button>
		</div>
	</Transition>
</div>
</template>

<script lang="ts" setup>
import { onMounted, ref, shallowRef, watch } from 'vue';

const props = withDefaults(defineProps<{
	showHeader?: boolean;
	thin?: boolean;
	naked?: boolean;
	foldable?: boolean;
	scrollable?: boolean;
	expanded?: boolean;
	maxHeight?: number | null;
}>(), {
	expanded: true,
	showHeader: true,
	maxHeight: null,
});
const rootEl = shallowRef<HTMLElement>();
const contentEl = shallowRef<HTMLElement>();
const headerEl = shallowRef<HTMLElement>();
const showBody = ref(props.expanded);
const ignoreOmit = ref(false);
const omitted = ref(false);
function enter(el) {
	const elementHeight = el.getBoundingClientRect().height;
	el.style.height = 0;
	el.offsetHeight; // reflow
	el.style.height = Math.min(elementHeight, props.maxHeight ?? Infinity) + 'px';
}
function afterEnter(el) {
	el.style.height = null;
}
function leave(el) {
	const elementHeight = el.getBoundingClientRect().height;
	el.style.height = elementHeight + 'px';
	el.offsetHeight; // reflow
	el.style.height = 0;
}
function afterLeave(el) {
	el.style.height = null;
}
const calcOmit = () => {
	if (omitted.value || ignoreOmit.value || props.maxHeight == null) return;
	const height = contentEl.value.offsetHeight;
	omitted.value = height > props.maxHeight;
};
onMounted(() => {
	watch(showBody, v => {
		const headerHeight = props.showHeader ? headerEl.value.offsetHeight : 0;
		rootEl.value.style.minHeight = `${headerHeight}px`;
		if (v) {
			rootEl.value.style.flexBasis = 'auto';
		} else {
			rootEl.value.style.flexBasis = `${headerHeight}px`;
		}
	}, {
		immediate: true,
	});
	rootEl.value.style.setProperty('--maxHeight', props.maxHeight + 'px');
	calcOmit();
	new ResizeObserver((entries, observer) => {
		calcOmit();
	}).observe(contentEl.value);
});
</script>

<style lang="scss" scoped>
.container-toggle-enter-active, .container-toggle-leave-active {
	overflow-y: hidden;
	transition: opacity 0.5s, height 0.5s !important;
}
.container-toggle-enter-from {
	opacity: 0;
}
.container-toggle-leave-to {
	opacity: 0;
}

.ukygtjoj {
	position: relative;
	overflow: clip;
	contain: content;

	&.naked {
		background: transparent !important;
		box-shadow: none !important;
	}

	&.scrollable {
		display: flex;
		flex-direction: column;

		> .content {
			overflow: auto;
		}
	}

	> header {
		position: sticky;
		top: var(--stickyTop, 0px);
		left: 0;
		color: var(--panelHeaderFg);
		background: var(--panelHeaderBg);
		border-bottom: solid 0.5px var(--panelHeaderDivider);
		z-index: 2;
		line-height: 1.4em;

		> .title {
			margin: 0;
			padding: 12px 16px;

			> ::v-deep(i) {
				margin-right: 6px;
			}

			&:empty {
				display: none;
			}
		}

		> .sub {
			position: absolute;
			z-index: 2;
			top: 0;
			right: 0;
			height: 100%;

			> ::v-deep(button) {
				width: 42px;
				height: 100%;
			}
		}
	}

	> .content {
		--stickyTop: 0px;

		&.omitted {
			position: relative;
			max-height: var(--maxHeight);
			overflow: hidden;

			> .fade {
				display: block;
				position: absolute;
				z-index: 10;
				bottom: 0;
				left: 0;
				width: 100%;
				height: 64px;
				background: linear-gradient(0deg, var(--panel), var(--X15));

				> span {
					display: inline-block;
					background: var(--panel);
					padding: 6px 10px;
					font-size: 0.8em;
					border-radius: 999px;
					box-shadow: 0 2px 6px rgb(0 0 0 / 20%);
				}

				&:hover {
					> span {
						background: var(--panelHighlight);
					}
				}
			}
		}
	}

	&.max-width_380px, &.thin {
		> header {
			> .title {
				padding: 8px 10px;
				font-size: 0.9em;
			}
		}
	}
}

._forceContainerFull_ .ukygtjoj {
	> header {
		> .title {
			padding: 12px 16px !important;
		}
	}
}

._forceContainerFull_.ukygtjoj {
	> header {
		> .title {
			padding: 12px 16px !important;
		}
	}
}
</style>
