// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'seat_map_list_response_dto_output.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$SeatMapListResponseDtoOutput extends SeatMapListResponseDtoOutput {
  @override
  final BuiltList<SeatMapListResponseDtoOutputItemsInner> items;
  @override
  final String? nextCursor;

  factory _$SeatMapListResponseDtoOutput(
          [void Function(SeatMapListResponseDtoOutputBuilder)? updates]) =>
      (SeatMapListResponseDtoOutputBuilder()..update(updates))._build();

  _$SeatMapListResponseDtoOutput._({required this.items, this.nextCursor})
      : super._();
  @override
  SeatMapListResponseDtoOutput rebuild(
          void Function(SeatMapListResponseDtoOutputBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  SeatMapListResponseDtoOutputBuilder toBuilder() =>
      SeatMapListResponseDtoOutputBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is SeatMapListResponseDtoOutput &&
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
    return (newBuiltValueToStringHelper(r'SeatMapListResponseDtoOutput')
          ..add('items', items)
          ..add('nextCursor', nextCursor))
        .toString();
  }
}

class SeatMapListResponseDtoOutputBuilder
    implements
        Builder<SeatMapListResponseDtoOutput,
            SeatMapListResponseDtoOutputBuilder> {
  _$SeatMapListResponseDtoOutput? _$v;

  ListBuilder<SeatMapListResponseDtoOutputItemsInner>? _items;
  ListBuilder<SeatMapListResponseDtoOutputItemsInner> get items =>
      _$this._items ??= ListBuilder<SeatMapListResponseDtoOutputItemsInner>();
  set items(ListBuilder<SeatMapListResponseDtoOutputItemsInner>? items) =>
      _$this._items = items;

  String? _nextCursor;
  String? get nextCursor => _$this._nextCursor;
  set nextCursor(String? nextCursor) => _$this._nextCursor = nextCursor;

  SeatMapListResponseDtoOutputBuilder() {
    SeatMapListResponseDtoOutput._defaults(this);
  }

  SeatMapListResponseDtoOutputBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _nextCursor = $v.nextCursor;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(SeatMapListResponseDtoOutput other) {
    _$v = other as _$SeatMapListResponseDtoOutput;
  }

  @override
  void update(void Function(SeatMapListResponseDtoOutputBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  SeatMapListResponseDtoOutput build() => _build();

  _$SeatMapListResponseDtoOutput _build() {
    _$SeatMapListResponseDtoOutput _$result;
    try {
      _$result = _$v ??
          _$SeatMapListResponseDtoOutput._(
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
            r'SeatMapListResponseDtoOutput', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
