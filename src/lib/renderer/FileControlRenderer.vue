<template>
  <control-wrapper
      v-bind="controlWrapper"
      :styles="styles"
      :isFocused="isFocused"
      :appliedOptions="appliedOptions"
  >
    <input
        :id="control.id + '-input'"
        ref="inputFile"
        type="file"
        :class="styles.control.input"
        :disabled="!control.enabled"
        :autofocus="appliedOptions.focus"
        :placeholder="appliedOptions.placeholder"
        @change="onChange"
        @focus="isFocused = true"
        @blur="isFocused = false"
    />

    <div v-if="uploading">
      UPLOADING ...
    </div>

<!--   :value="control.data"-->

  </control-wrapper>
</template>

<script lang="ts">
import {
  ControlElement,
  JsonFormsRendererRegistryEntry,
  rankWith,
} from '@jsonforms/core';
import { defineComponent } from 'vue';
import { rendererProps, useJsonFormsControl, RendererProps } from '@jsonforms/vue';
import { default as ControlWrapper } from '@jsonforms/vue-vanilla/src/controls/ControlWrapper.vue';
import { useVanillaControl } from '@jsonforms/vue-vanilla/src/util';
import {and, schemaMatches,  uiTypeIs} from "@jsonforms/core/src/testers/testers";

const controlRenderer = defineComponent({
  name: 'file-control-renderer',
  components: {
    ControlWrapper
  },
  props: {
    ...rendererProps<ControlElement>()
  },
  setup(props: RendererProps<ControlElement>) {
    const c = useVanillaControl(useJsonFormsControl(props), target => target.value || undefined);
    const onChangeRoot = c.onChange;

    const uploading = ref(false);

    const onChange = async (e) => {

      uploading.value = true;

      const formData = new FormData();
      Object.values(e.target.files)?.map((file: any) => formData.append('file[]', file));

      // const status = await http.post("/api/users", formData, formData, {
      //   headers: {
      //     "Content-Type": "multipart/form-data",
      //   },
      // });
      // await fetch('/upload', {
      //   method: 'POST',
      //   body: formData
      // });

      //change on upload success
      const onUploadSuccess = (e) => {
        uploading.value = false;

        const finalPath = 'http://todo.file.path/img.jpg';

        onChangeRoot({target:{value:finalPath}});
      }
      setTimeout(() => onUploadSuccess(e),100);
    }

    return {
      ...c,
      onChange,
      uploading
    };
  },
  methods: {

  }
});
export default controlRenderer;
export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(2,
      and(
          uiTypeIs('Control'),
          schemaMatches(schema => schema?.format === 'file')
      )
  )
};
</script>
