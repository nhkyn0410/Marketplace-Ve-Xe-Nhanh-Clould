// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'operator_stop_point_list_response_dto_output.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$OperatorStopPointListResponseDtoOutput
    extends OperatorStopPointListResponseDtoOutput {
  @override
  final BuiltList<OperatorStopPointListResponseDtoOutputItemsInner> items;
  @override
  final String? nextCursor;

  factory _$OperatorStopPointListResponseDtoOutput(
          [void Function(OperatorStopPointListResponseDtoOutputBuilder)?
              updates]) =>
      (OperatorStopPointListResponseDtoOutputBuilder()..update(updates))
          ._build();

  _$OperatorStopPointListResponseDtoOutput._(
      {required this.items, this.nextCursor})
      : super._();
  @override
  OperatorStopPointListResponseDtoOutput rebuild(
          void Function(OperatorStopPointListResponseDtoOutputBuilder)
              updates) =>
      (toBuilder()..update(updates)).build();

  @override
  OperatorStopPointListResponseDtoOutputBuilder toBuilder() =>
      OperatorStopPointListResponseDtoOutputBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is OperatorStopPointListResponseDtoOutput &&
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
            r'OperatorStopPointListResponseDtoOutput')
          ..add('items', items)
          ..add('nextCursor', nextCursor))
        .toString();
  }
}

class OperatorStopPointListResponseDtoOutputBuilder
    implements
        Builder<OperatorStopPointListResponseDtoOutput,
            OperatorStopPointListResponseDtoOutputBuilder> {
  _$OperatorStopPointListResponseDtoOutput? _$v;

  ListBuilder<OperatorStopPointListResponseDtoOutputItemsInner>? _items;
  ListBuilder<OperatorStopPointListResponseDtoOutputItemsInner> get items =>
      _$this._items ??=
          ListBuilder<OperatorStopPointListResponseDtoOutputItemsInner>();
  set items(
          ListBuilder<OperatorStopPointListResponseDtoOutputItemsInner>?
              items) =>
      _$this._items = items;

  String? _nextCursor;
  String? get nextCursor => _$this._nextCursor;
  set nextCursor(String? nextCursor) => _$this._nextCursor = nextCursor;

  OperatorStopPointListResponseDtoOutputBuilder() {
    OperatorStopPointListResponseDtoOutput._defaults(this);
  }

  OperatorStopPointListResponseDtoOutputBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _nextCursor = $v.nextCursor;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(OperatorStopPointListResponseDtoOutput other) {
    _$v = other as _$OperatorStopPointListResponseDtoOutput;
  }

  @override
  void update(
      void Function(OperatorStopPointListResponseDtoOutputBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  OperatorStopPointListResponseDtoOutput build() => _build();

  _$OperatorStopPointListResponseDtoOutput _build() {
    _$OperatorStopPointListResponseDtoOutput _$result;
    try {
      _$result = _$v ??
          _$OperatorStopPointListResponseDtoOutput._(
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
            r'OperatorStopPointListResponseDtoOutput',
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
