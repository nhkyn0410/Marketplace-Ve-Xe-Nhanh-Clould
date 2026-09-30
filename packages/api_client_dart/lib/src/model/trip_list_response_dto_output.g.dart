// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'trip_list_response_dto_output.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$TripListResponseDtoOutput extends TripListResponseDtoOutput {
  @override
  final BuiltList<TripListResponseDtoOutputItemsInner> items;
  @override
  final String? nextCursor;

  factory _$TripListResponseDtoOutput(
          [void Function(TripListResponseDtoOutputBuilder)? updates]) =>
      (TripListResponseDtoOutputBuilder()..update(updates))._build();

  _$TripListResponseDtoOutput._({required this.items, this.nextCursor})
      : super._();
  @override
  TripListResponseDtoOutput rebuild(
          void Function(TripListResponseDtoOutputBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  TripListResponseDtoOutputBuilder toBuilder() =>
      TripListResponseDtoOutputBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is TripListResponseDtoOutput &&
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
    return (newBuiltValueToStringHelper(r'TripListResponseDtoOutput')
          ..add('items', items)
          ..add('nextCursor', nextCursor))
        .toString();
  }
}

class TripListResponseDtoOutputBuilder
    implements
        Builder<TripListResponseDtoOutput, TripListResponseDtoOutputBuilder> {
  _$TripListResponseDtoOutput? _$v;

  ListBuilder<TripListResponseDtoOutputItemsInner>? _items;
  ListBuilder<TripListResponseDtoOutputItemsInner> get items =>
      _$this._items ??= ListBuilder<TripListResponseDtoOutputItemsInner>();
  set items(ListBuilder<TripListResponseDtoOutputItemsInner>? items) =>
      _$this._items = items;

  String? _nextCursor;
  String? get nextCursor => _$this._nextCursor;
  set nextCursor(String? nextCursor) => _$this._nextCursor = nextCursor;

  TripListResponseDtoOutputBuilder() {
    TripListResponseDtoOutput._defaults(this);
  }

  TripListResponseDtoOutputBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _nextCursor = $v.nextCursor;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(TripListResponseDtoOutput other) {
    _$v = other as _$TripListResponseDtoOutput;
  }

  @override
  void update(void Function(TripListResponseDtoOutputBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  TripListResponseDtoOutput build() => _build();

  _$TripListResponseDtoOutput _build() {
    _$TripListResponseDtoOutput _$result;
    try {
      _$result = _$v ??
          _$TripListResponseDtoOutput._(
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
            r'TripListResponseDtoOutput', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
