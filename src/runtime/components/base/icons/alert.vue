<template>
  <svg
    version="1.1"
    id="Layer_1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    x="0px"
    y="0px"
    width="122.879px"
    height="97.311px"
    viewBox="0 0 122.879 97.311"
    enable-background="new 0 0 122.879 97.311"
    xml:space="preserve"
  >
    <title>{{ title }}</title>
    <g>
      <path
        :fill="color"
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M65.45,1.972l55.594,87.323c1.673,2.63,3.117,8.016,0,8.016H1.837 c-3.118,0-1.676-5.386,0-8.016L57.431,1.972C59.106-0.658,63.774-0.656,65.45,1.972L65.45,1.972z M56.578,74.146h9.682v8.561 h-9.682V74.146L56.578,74.146z M66.254,68.217H56.58c-0.964-11.756-2.982-19.216-2.982-30.955c0-4.331,3.51-7.842,7.841-7.842 c4.332,0,7.842,3.511,7.842,7.842C69.282,48.996,67.236,56.471,66.254,68.217L66.254,68.217z"
      />
    </g>
  </svg>
</template>

<script setup>
// Define component props using defineProps
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: 'red',
  },
})
</script>
