<template>
  <article class="p-4">

    <h2 class="text-xl" v-text="header"/>
    <p>{{ text }}</p>

    <JsonFormsSubmittable
      :jsonforms="jf"
      @submit="onSubmit"
    />

  </article>
</template>


<script setup lang="ts">
import JsonFormsSubmittable from "../JsonFormsSubmittable.vue";
import jf from "../../lib/jsonforms/prompt_newitem.forms.json";

const props = defineProps<{
  header: string,
  text: string,
  dialogId?: string,
}>()
const emit = defineEmits<{
  (name: 'submit', payload:any): void,
}>()

const onSubmit = (data:any) => {
  emit('submit', data.name)
  const dialog = (props?.dialogId && document.getElementById(props?.dialogId)) as HTMLDialogElement|undefined;
  dialog?.close(data.name); //returValue is alwasy true?!?!
}

</script>

