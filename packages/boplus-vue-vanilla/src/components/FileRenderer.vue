<template>

  <ControlWrapper
      v-bind="controlWrapper"
      :styles="styles"
      :isFocused="isFocused"
      :appliedOptions="appliedOptions"
  >

    <input
        type="file"
        :id="control.id + '-input'"
        :class="[styles.control.input, {wait:processing}]"
        :disabled="!control.enabled || processing"
        :autofocus="appliedOptions.focus"
        :placeholder="appliedOptions.placeholder"
        :required="control.required"
        :accept="accept"
        @change="selectFile"
        @focus="isFocused = true"
        @blur="isFocused = false"
    />

  </ControlWrapper>

</template>

<style>
@keyframes color {
  0% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
  100% {
    opacity: 1;
  }
}
</style>
<style scoped>
.wait {
  animation-name: color;
  animation-duration: 1.5s;
  animation-iteration-count: infinite;
  cursor: progress !important;
}
</style>


<script lang="ts">
import {rendererProps, useJsonFormsControl} from '@jsonforms/vue';
import {useVanillaControl} from '@jsonforms/vue-vanilla/src/util';
import {isStringControl, rankWith, uiTypeIs} from "@jsonforms/core";
import type {JsonSchema} from "@jsonforms/core";
import type {ControlProps} from "@jsonforms/vue/src/jsonFormsCompositions";
import {ControlWrapper} from "@jsonforms/vue-vanilla";
import {and, schemaMatches} from "@jsonforms/core/src/testers/testers";
import {computed, ref} from "vue";
import type {Ref} from "vue";


/**
 * @see https://github.com/kchobantonov/camunda-jsonforms-plugin/blob/master/plugin-ui/packages/common/src/renderers/FileRenderer.vue
 * @see https://json-schema.org/understanding-json-schema/reference/non_json_data.html
 */

export const fileRenderer = {
  components: {ControlWrapper},
  props: rendererProps<ControlProps>(),
  setup(props: ControlProps) {
    const currentFile = ref<File | undefined>(undefined);
    let fileReader = new FileReader();
    const currentFileValidationErrors = ref<string | null>(null);

    const input = useVanillaControl(useJsonFormsControl(props));
    const control = input.control as any as Ref;
    const processing = ref(false);
    const progress = ref(0);

    const accept = computed((): string | undefined => (control.value.schema as any)?.contentMediaType);

    const selectFile = async (event: Event) => {
      const files = (event?.target as any).files;
      const file = files && files[0];

      const schema: JsonSchema = control.value.schema;

      //:TODO add maxFileFiles
      currentFileValidationErrors.value = null;
      // if (null !== value) {
      //   // if (maxFileSize) {
      //   //   const maxFileSizeValid = maxFileSizeExclusive
      //   //       ? value.size < maxFileSize
      //   //       : value.size <= maxFileSize;
      //   //   if (!maxFileSizeValid) {
      //   //     const key = getI18nKey(
      //   //         control.schema,
      //   //         control.uischema,
      //   //         control.path,
      //   //         maxFileSizeExclusive
      //   //             ? 'error.formatExclusiveMaximum'
      //   //             : 'error.formatMaximum'
      //   //     );
      //   //     const formatSize = formatBytes(maxFileSize);
      //   //     currentFileValidationErrors = t(
      //   //         key,
      //   //         `size should be less than ${formatSize}`,
      //   //         {
      //   //           limitText: `${formatSize}`,
      //   //           limit: `${maxFileSize}`,
      //   //         }
      //   //     );
      //   //   }
      //   // }
      //   // if (minFileSize) {
      //   //   const minFileSizeValid = minFileSizeExclusive
      //   //       ? value.size > minFileSize
      //   //       : value.size >= minFileSize;
      //   //   if (!minFileSizeValid) {
      //   //     const key = getI18nKey(
      //   //         control.schema,
      //   //         control.uischema,
      //   //         control.path,
      //   //         minFileSizeExclusive
      //   //             ? 'error.formatExclusiveMinimum'
      //   //             : 'error.formatMinimum'
      //   //     );
      //   //     const formatSize = formatBytes(minFileSize);
      //   //     currentFileValidationErrors = t(
      //   //         key,
      //   //         `size should be greater than ${formatSize}`,
      //   //         {
      //   //           limitText: `${formatSize}`,
      //   //           limit: `${maxFileSize}`,
      //   //         }
      //   //     );
      //   //   }
      //   // }
      // }

      let value;
      if (file) {
        processing.value = true;

        value = await toBase64(file, new FileReader(), schema?.format, progress );

        processing.value = false;
      }

      input.onChange({target:{value:value}} as any);
    };


    return {
      ...input,
      //t,
      processing,
      currentFile,
      currentFileReader: fileReader,
      currentFileValidationErrors,

      accept,
      selectFile,
      progress,
    }
  }
}

const toBase64 = (file:File, reader:FileReader, schemaFormat?:string, progress?:any) =>
    new Promise((resolve, reject) => {
      reader.onload = () => {
        const dataurl = reader.result as string;
        if (schemaFormat === 'uri') {
          resolve(dataurl);
        } else if (schemaFormat === 'binary') {
          //special handling to encode the filename
          const insertIndex = dataurl.indexOf(';base64,');
          resolve(
              dataurl.substring(0, insertIndex) +
              `;filename=${encodeURIComponent(file.name)}` +
              dataurl.substring(insertIndex)
          );
        } else {
          resolve(dataurl.substring(dataurl.indexOf(',') + 1));
        }
      };
      reader.onabort = (error) => reject(error);
      reader.onerror = (error) => reject(error);
      reader.onprogress = (p) => {
        if (progress && p.lengthComputable) {
          progress.value = Number((p.loaded / p.total) * 100).toFixed(0);
        }
      };

      reader.readAsDataURL(file);
    });

export default fileRenderer;
export const fileEntry = {
  renderer: fileRenderer,
  tester: rankWith(2,  and(
      isStringControl,
      uiTypeIs('Control'),
      schemaMatches( (schema:any) => schema.contentEncoding === 'base64' || schema.format === 'binary' || schema.format === 'byte')
  ))
};
</script>
