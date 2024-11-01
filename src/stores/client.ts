import * as UiReact from "tinybase/ui-react/with-schemas";
import { tableSchema, valueSchema } from "./shared.ts";

const UiReactWithSchemas = UiReact as UiReact.WithSchemas<
	[typeof tableSchema, typeof valueSchema]
>;
// Yucky, but better than:
// import def './this.ts';
// const { CellView } = def;
export const BackwardCheckpointsView =
	UiReactWithSchemas.BackwardCheckpointsView;
export const CellView = UiReactWithSchemas.CellView;
export const CheckpointView = UiReactWithSchemas.CheckpointView;
export const CurrentCheckpointView = UiReactWithSchemas.CurrentCheckpointView;
export const ForwardCheckpointsView = UiReactWithSchemas.ForwardCheckpointsView;
export const IndexView = UiReactWithSchemas.IndexView;
export const LinkedRowsView = UiReactWithSchemas.LinkedRowsView;
export const LocalRowsView = UiReactWithSchemas.LocalRowsView;
export const MetricView = UiReactWithSchemas.MetricView;
export const Provider = UiReactWithSchemas.Provider;
export const RemoteRowView = UiReactWithSchemas.RemoteRowView;
export const ResultCellView = UiReactWithSchemas.ResultCellView;
export const ResultRowView = UiReactWithSchemas.ResultRowView;
export const ResultSortedTableView = UiReactWithSchemas.ResultSortedTableView;
export const ResultTableView = UiReactWithSchemas.ResultTableView;
export const RowView = UiReactWithSchemas.RowView;
export const SliceView = UiReactWithSchemas.SliceView;
export const SortedTableView = UiReactWithSchemas.SortedTableView;
export const TableView = UiReactWithSchemas.TableView;
export const TablesView = UiReactWithSchemas.TablesView;
export const ValueView = UiReactWithSchemas.ValueView;
export const ValuesView = UiReactWithSchemas.ValuesView;
export const useAddRowCallback = UiReactWithSchemas.useAddRowCallback;
export const useCell = UiReactWithSchemas.useCell;
export const useCellIds = UiReactWithSchemas.useCellIds;
export const useCellIdsListener = UiReactWithSchemas.useCellIdsListener;
export const useCellListener = UiReactWithSchemas.useCellListener;
export const useCheckpoint = UiReactWithSchemas.useCheckpoint;
export const useCheckpointIds = UiReactWithSchemas.useCheckpointIds;
export const useCheckpointIdsListener =
	UiReactWithSchemas.useCheckpointIdsListener;
export const useCheckpointListener = UiReactWithSchemas.useCheckpointListener;
export const useCheckpoints = UiReactWithSchemas.useCheckpoints;
export const useCheckpointsIds = UiReactWithSchemas.useCheckpointsIds;
export const useCheckpointsOrCheckpointsById =
	UiReactWithSchemas.useCheckpointsOrCheckpointsById;
export const useCreateCheckpoints = UiReactWithSchemas.useCreateCheckpoints;
export const useCreateIndexes = UiReactWithSchemas.useCreateIndexes;
export const useCreateMergeableStore =
	UiReactWithSchemas.useCreateMergeableStore;
export const useCreateMetrics = UiReactWithSchemas.useCreateMetrics;
export const useCreatePersister = UiReactWithSchemas.useCreatePersister;
export const useCreateQueries = UiReactWithSchemas.useCreateQueries;
export const useCreateRelationships = UiReactWithSchemas.useCreateRelationships;
export const useCreateStore = UiReactWithSchemas.useCreateStore;
export const useCreateSynchronizer = UiReactWithSchemas.useCreateSynchronizer;
export const useDelCellCallback = UiReactWithSchemas.useDelCellCallback;
export const useDelRowCallback = UiReactWithSchemas.useDelRowCallback;
export const useDelTableCallback = UiReactWithSchemas.useDelTableCallback;
export const useDelTablesCallback = UiReactWithSchemas.useDelTablesCallback;
export const useDelValueCallback = UiReactWithSchemas.useDelValueCallback;
export const useDelValuesCallback = UiReactWithSchemas.useDelValuesCallback;
export const useDidFinishTransactionListener =
	UiReactWithSchemas.useDidFinishTransactionListener;
export const useGoBackwardCallback = UiReactWithSchemas.useGoBackwardCallback;
export const useGoForwardCallback = UiReactWithSchemas.useGoForwardCallback;
export const useGoToCallback = UiReactWithSchemas.useGoToCallback;
export const useHasCell = UiReactWithSchemas.useHasCell;
export const useHasCellListener = UiReactWithSchemas.useHasCellListener;
export const useHasRow = UiReactWithSchemas.useHasRow;
export const useHasRowListener = UiReactWithSchemas.useHasRowListener;
export const useHasTable = UiReactWithSchemas.useHasTable;
export const useHasTableCell = UiReactWithSchemas.useHasTableCell;
export const useHasTableCellListener =
	UiReactWithSchemas.useHasTableCellListener;
export const useHasTableListener = UiReactWithSchemas.useHasTableListener;
export const useHasTables = UiReactWithSchemas.useHasTables;
export const useHasTablesListener = UiReactWithSchemas.useHasTablesListener;
export const useHasValue = UiReactWithSchemas.useHasValue;
export const useHasValueListener = UiReactWithSchemas.useHasValueListener;
export const useHasValues = UiReactWithSchemas.useHasValues;
export const useHasValuesListener = UiReactWithSchemas.useHasValuesListener;
export const useIndexIds = UiReactWithSchemas.useIndexIds;
export const useIndexes = UiReactWithSchemas.useIndexes;
export const useIndexesIds = UiReactWithSchemas.useIndexesIds;
export const useIndexesOrIndexesById =
	UiReactWithSchemas.useIndexesOrIndexesById;
export const useLinkedRowIds = UiReactWithSchemas.useLinkedRowIds;
export const useLinkedRowIdsListener =
	UiReactWithSchemas.useLinkedRowIdsListener;
export const useLocalRowIds = UiReactWithSchemas.useLocalRowIds;
export const useLocalRowIdsListener = UiReactWithSchemas.useLocalRowIdsListener;
export const useMetric = UiReactWithSchemas.useMetric;
export const useMetricIds = UiReactWithSchemas.useMetricIds;
export const useMetricListener = UiReactWithSchemas.useMetricListener;
export const useMetrics = UiReactWithSchemas.useMetrics;
export const useMetricsIds = UiReactWithSchemas.useMetricsIds;
export const useMetricsOrMetricsById =
	UiReactWithSchemas.useMetricsOrMetricsById;
export const usePersister = UiReactWithSchemas.usePersister;
export const usePersisterIds = UiReactWithSchemas.usePersisterIds;
export const usePersisterOrPersisterById =
	UiReactWithSchemas.usePersisterOrPersisterById;
export const usePersisterStatus = UiReactWithSchemas.usePersisterStatus;
export const usePersisterStatusListener =
	UiReactWithSchemas.usePersisterStatusListener;
export const useProvideCheckpoints = UiReactWithSchemas.useProvideCheckpoints;
export const useProvideIndexes = UiReactWithSchemas.useProvideIndexes;
export const useProvideMetrics = UiReactWithSchemas.useProvideMetrics;
export const useProvidePersister = UiReactWithSchemas.useProvidePersister;
export const useProvideQueries = UiReactWithSchemas.useProvideQueries;
export const useProvideRelationships =
	UiReactWithSchemas.useProvideRelationships;
export const useProvideStore = UiReactWithSchemas.useProvideStore;
export const useProvideSynchronizer = UiReactWithSchemas.useProvideSynchronizer;
export const useQueries = UiReactWithSchemas.useQueries;
export const useQueriesIds = UiReactWithSchemas.useQueriesIds;
export const useQueriesOrQueriesById =
	UiReactWithSchemas.useQueriesOrQueriesById;
export const useQueryIds = UiReactWithSchemas.useQueryIds;
export const useRedoInformation = UiReactWithSchemas.useRedoInformation;
export const useRelationshipIds = UiReactWithSchemas.useRelationshipIds;
export const useRelationships = UiReactWithSchemas.useRelationships;
export const useRelationshipsIds = UiReactWithSchemas.useRelationshipsIds;
export const useRelationshipsOrRelationshipsById =
	UiReactWithSchemas.useRelationshipsOrRelationshipsById;
export const useRemoteRowId = UiReactWithSchemas.useRemoteRowId;
export const useRemoteRowIdListener = UiReactWithSchemas.useRemoteRowIdListener;
export const useResultCell = UiReactWithSchemas.useResultCell;
export const useResultCellIds = UiReactWithSchemas.useResultCellIds;
export const useResultCellIdsListener =
	UiReactWithSchemas.useResultCellIdsListener;
export const useResultCellListener = UiReactWithSchemas.useResultCellListener;
export const useResultRow = UiReactWithSchemas.useResultRow;
export const useResultRowCount = UiReactWithSchemas.useResultRowCount;
export const useResultRowCountListener =
	UiReactWithSchemas.useResultRowCountListener;
export const useResultRowIds = UiReactWithSchemas.useResultRowIds;
export const useResultRowIdsListener =
	UiReactWithSchemas.useResultRowIdsListener;
export const useResultRowListener = UiReactWithSchemas.useResultRowListener;
export const useResultSortedRowIds = UiReactWithSchemas.useResultSortedRowIds;
export const useResultSortedRowIdsListener =
	UiReactWithSchemas.useResultSortedRowIdsListener;
export const useResultTable = UiReactWithSchemas.useResultTable;
export const useResultTableCellIds = UiReactWithSchemas.useResultTableCellIds;
export const useResultTableCellIdsListener =
	UiReactWithSchemas.useResultTableCellIdsListener;
export const useResultTableListener = UiReactWithSchemas.useResultTableListener;
export const useRow = UiReactWithSchemas.useRow;
export const useRowCount = UiReactWithSchemas.useRowCount;
export const useRowCountListener = UiReactWithSchemas.useRowCountListener;
export const useRowIds = UiReactWithSchemas.useRowIds;
export const useRowIdsListener = UiReactWithSchemas.useRowIdsListener;
export const useRowListener = UiReactWithSchemas.useRowListener;
export const useSetCellCallback = UiReactWithSchemas.useSetCellCallback;
export const useSetCheckpointCallback =
	UiReactWithSchemas.useSetCheckpointCallback;
export const useSetPartialRowCallback =
	UiReactWithSchemas.useSetPartialRowCallback;
export const useSetPartialValuesCallback =
	UiReactWithSchemas.useSetPartialValuesCallback;
export const useSetRowCallback = UiReactWithSchemas.useSetRowCallback;
export const useSetTableCallback = UiReactWithSchemas.useSetTableCallback;
export const useSetTablesCallback = UiReactWithSchemas.useSetTablesCallback;
export const useSetValueCallback = UiReactWithSchemas.useSetValueCallback;
export const useSetValuesCallback = UiReactWithSchemas.useSetValuesCallback;
export const useSliceIds = UiReactWithSchemas.useSliceIds;
export const useSliceIdsListener = UiReactWithSchemas.useSliceIdsListener;
export const useSliceRowIds = UiReactWithSchemas.useSliceRowIds;
export const useSliceRowIdsListener = UiReactWithSchemas.useSliceRowIdsListener;
export const useSortedRowIds = UiReactWithSchemas.useSortedRowIds;
export const useSortedRowIdsListener =
	UiReactWithSchemas.useSortedRowIdsListener;
export const useStartTransactionListener =
	UiReactWithSchemas.useStartTransactionListener;
export const useStore = UiReactWithSchemas.useStore;
export const useStoreIds = UiReactWithSchemas.useStoreIds;
export const useStoreOrStoreById = UiReactWithSchemas.useStoreOrStoreById;
export const useSynchronizer = UiReactWithSchemas.useSynchronizer;
export const useSynchronizerIds = UiReactWithSchemas.useSynchronizerIds;
export const useSynchronizerOrSynchronizerById =
	UiReactWithSchemas.useSynchronizerOrSynchronizerById;
export const useSynchronizerStatus = UiReactWithSchemas.useSynchronizerStatus;
export const useSynchronizerStatusListener =
	UiReactWithSchemas.useSynchronizerStatusListener;
export const useTable = UiReactWithSchemas.useTable;
export const useTableCellIds = UiReactWithSchemas.useTableCellIds;
export const useTableCellIdsListener =
	UiReactWithSchemas.useTableCellIdsListener;
export const useTableIds = UiReactWithSchemas.useTableIds;
export const useTableIdsListener = UiReactWithSchemas.useTableIdsListener;
export const useTableListener = UiReactWithSchemas.useTableListener;
export const useTables = UiReactWithSchemas.useTables;
export const useTablesListener = UiReactWithSchemas.useTablesListener;
export const useUndoInformation = UiReactWithSchemas.useUndoInformation;
export const useValue = UiReactWithSchemas.useValue;
export const useValueIds = UiReactWithSchemas.useValueIds;
export const useValueIdsListener = UiReactWithSchemas.useValueIdsListener;
export const useValueListener = UiReactWithSchemas.useValueListener;
export const useValues = UiReactWithSchemas.useValues;
export const useValuesListener = UiReactWithSchemas.useValuesListener;
export const useWillFinishTransactionListener =
	UiReactWithSchemas.useWillFinishTransactionListener;
