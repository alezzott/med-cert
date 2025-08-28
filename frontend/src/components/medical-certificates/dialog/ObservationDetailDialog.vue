<template>
  <Dialog :open="open" @update:open="emitUpdateOpen">
    <DialogContent>
      <DialogHeader>
        <DialogClose @click="emitClose" />
      </DialogHeader>
      <DialogDescription>
        <span v-html="text.replace(/\n/g, '<br>')" />
      </DialogDescription>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from '@/components/ui/dialog/Dialog.vue';
import DialogContent from '@/components/ui/dialog/DialogContent.vue';
import DialogHeader from '@/components/ui/dialog/DialogHeader.vue';
import DialogDescription from '@/components/ui/dialog/DialogDescription.vue';
import DialogClose from '@/components/ui/dialog/DialogClose.vue';

defineProps<{
  open: boolean;
  text: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update:open', value: boolean): void;
}>();

function emitClose() {
  emit('close');
  emit('update:open', false);
}

function emitUpdateOpen(value: boolean) {
  emit('update:open', value);
  if (!value) emit('close');
}
</script>
