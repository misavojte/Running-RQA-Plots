<script lang="ts">
    interface Props {
        minRecurrenceStructureLength: number;
    }

    let { minRecurrenceStructureLength = $bindable(2) }: Props = $props();
</script>

<div class="w-full max-w-2xl mx-auto py-4">
    <div class="bg-gray-50 rounded-lg border border-gray-200/80 p-6 shadow-sm">
        <div class="flex flex-col gap-3">
            <label for="minLength" class="text-sm font-medium text-gray-700">
                Minimum Structure Length
            </label>
            <div class="flex items-center gap-4">
                <input
                    type="range"
                    id="minLength"
                    bind:value={minRecurrenceStructureLength}
                    min="2"
                    max="10"
                    step="1"
                    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span class="text-sm font-medium text-gray-600 min-w-[2ch] text-center">
                    {minRecurrenceStructureLength}
                </span>
            </div>
            <p class="text-xs text-gray-500 mt-1">
                Adjust the minimum length required for diagonal and vertical line structures in recurrence plots
            </p>
        </div>
    </div>
</div>

