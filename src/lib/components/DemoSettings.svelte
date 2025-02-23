<script lang="ts">
    import type { MatrixGenerator } from "../types/MatrixGenerator.js";
    import type { Fixation } from "../types/Fixation.js";
    import { computeRecurrenceMatrix, computeEuclideanRecurrenceMatrix } from "../utils/recurrenceMatrix.js";

    interface Props {
        minRecurrenceStructureLength: number;
        matrixGenerator: MatrixGenerator;
    }

    let { 
        minRecurrenceStructureLength = $bindable(2),
        matrixGenerator = $bindable(computeRecurrenceMatrix)
    }: Props = $props();

    // Define available matrix generators with derived Euclidean function
    const matrixGenerators =  $derived([
        { label: "AOI-based", fn: computeRecurrenceMatrix },
        { label: "Euclidean Distance", fn: (fixations: Fixation[]) => computeEuclideanRecurrenceMatrix(fixations, euclideanThreshold) }
    ]);

    // Track selected generator and threshold
    let selectedGenerator = $state(matrixGenerators[0]);
    let euclideanThreshold = $state(100);

    // Update matrixGenerator when selection changes
    $effect(() => {
        matrixGenerator = selectedGenerator.fn;
    });
</script>

<div class="w-full max-w-2xl mx-auto py-4">
    <div class="bg-gray-50 rounded-lg border border-gray-200/80 p-6 shadow-sm">
        <div class="flex flex-col gap-6">
            <!-- Matrix Generator Selection -->
            <div class="flex flex-col gap-3">
                <label for="matrixType" class="text-sm font-medium text-gray-700">
                    Recurrence Matrix Type
                </label>
                <select
                    id="matrixType"
                    bind:value={selectedGenerator}
                    class="w-full p-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    {#each matrixGenerators as generator}
                        <option value={generator}>{generator.label}</option>
                    {/each}
                </select>
                <p class="text-xs text-gray-500">
                    Choose the method for calculating recurrence between fixations
                </p>
            </div>

            <!-- Euclidean Distance Threshold (shown only when Euclidean distance is selected) -->
            {#if selectedGenerator.label === "Euclidean Distance"}
                <div class="flex flex-col gap-3">
                    <label for="threshold" class="text-sm font-medium text-gray-700">
                        Distance Threshold (pixels)
                    </label>
                    <div class="flex items-center gap-4">
                        <input
                            type="number"
                            id="threshold"
                            bind:value={euclideanThreshold}
                            min="1"
                            max="1000"
                            class="w-24 p-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <p class="text-xs text-gray-500">
                        Maximum distance between fixations to be considered recurrent
                    </p>
                </div>
            {/if}

            <!-- Minimum Structure Length -->
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
                <p class="text-xs text-gray-500">
                    Adjust the minimum length required for diagonal and vertical line structures in recurrence plots
                </p>
            </div>
        </div>
    </div>
</div>

