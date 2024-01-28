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
import JsonFormsSubmittable from "@/components/JsonFormsSubmittable.vue";
import jf from "@/lib/jsonforms/prompt_newitem.forms.json";
import {ModalControl} from "@/lib";

const props = defineProps<{
  header: string,
  text: string,
  modalControl?: ModalControl,
}>()
const emit = defineEmits<{
  (name: 'submit', payload:any): void,
}>()

console.log({props:props.modalControl});
const onSubmit = (data:any) => {
  emit('submit', data.name)

  props.modalControl?.close(data.name); //returValue is alwasy true?!?!
}

</script>

