// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'stop_point_proposal_list_response_dto_output.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$StopPointProposalListResponseDtoOutput
    extends StopPointProposalListResponseDtoOutput {
  @override
  final BuiltList<StopPointProposalListResponseDtoOutputItemsInner> items;
  @override
  final String? nextCursor;

  factory _$StopPointProposalListResponseDtoOutput(
          [void Function(StopPointProposalListResponseDtoOutputBuilder)?
              updates]) =>
      (StopPointProposalListResponseDtoOutputBuilder()..update(updates))
          ._build();

  _$StopPointProposalListResponseDtoOutput._(
      {required this.items, this.nextCursor})
      : super._();
  @override
  StopPointProposalListResponseDtoOutput rebuild(
          void Function(StopPointProposalListResponseDtoOutputBuilder)
              updates) =>
      (toBuilder()..update(updates)).build();

  @override
  StopPointProposalListResponseDtoOutputBuilder toBuilder() =>
      StopPointProposalListResponseDtoOutputBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is StopPointProposalListResponseDtoOutput &&
        items == other.items &&
        nextCursor == other.nextCursor;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, items.hashCode);
    _$hash = $jc(_$hash, nextCursor.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(
            r'StopPointProposalListResponseDtoOutput')
          ..add('items', items)
          ..add('nextCursor', nextCursor))
        .toString();
  }
}

class StopPointProposalListResponseDtoOutputBuilder
    implements
        Builder<StopPointProposalListResponseDtoOutput,
            StopPointProposalListResponseDtoOutputBuilder> {
  _$StopPointProposalListResponseDtoOutput? _$v;

  ListBuilder<StopPointProposalListResponseDtoOutputItemsInner>? _items;
  ListBuilder<StopPointProposalListResponseDtoOutputItemsInner> get items =>
      _$this._items ??=
          ListBuilder<StopPointProposalListResponseDtoOutputItemsInner>();
  set items(
          ListBuilder<StopPointProposalListResponseDtoOutputItemsInner>?
              items) =>
      _$this._items = items;

  String? _nextCursor;
  String? get nextCursor => _$this._nextCursor;
  set nextCursor(String? nextCursor) => _$this._nextCursor = nextCursor;

  StopPointProposalListResponseDtoOutputBuilder() {
    StopPointProposalListResponseDtoOutput._defaults(this);
  }

  StopPointProposalListResponseDtoOutputBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _nextCursor = $v.nextCursor;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(StopPointProposalListResponseDtoOutput other) {
    _$v = other as _$StopPointProposalListResponseDtoOutput;
  }

  @override
  void update(
      void Function(StopPointProposalListResponseDtoOutputBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  StopPointProposalListResponseDtoOutput build() => _build();

  _$StopPointProposalListResponseDtoOutput _build() {
    _$StopPointProposalListResponseDtoOutput _$result;
    try {
      _$result = _$v ??
          _$StopPointProposalListResponseDtoOutput._(
            items: items.build(),
            nextCursor: nextCursor,
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'StopPointProposalListResponseDtoOutput',
            _$failedField,
            e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
