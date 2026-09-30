// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'fare_list_response_dto_output.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$FareListResponseDtoOutput extends FareListResponseDtoOutput {
  @override
  final BuiltList<FareListResponseDtoOutputItemsInner> items;
  @override
  final String? nextCursor;

  factory _$FareListResponseDtoOutput(
          [void Function(FareListResponseDtoOutputBuilder)? updates]) =>
      (FareListResponseDtoOutputBuilder()..update(updates))._build();

  _$FareListResponseDtoOutput._({required this.items, this.nextCursor})
      : super._();
  @override
  FareListResponseDtoOutput rebuild(
          void Function(FareListResponseDtoOutputBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  FareListResponseDtoOutputBuilder toBuilder() =>
      FareListResponseDtoOutputBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is FareListResponseDtoOutput &&
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
    return (newBuiltValueToStringHelper(r'FareListResponseDtoOutput')
          ..add('items', items)
          ..add('nextCursor', nextCursor))
        .toString();
  }
}

class FareListResponseDtoOutputBuilder
    implements
        Builder<FareListResponseDtoOutput, FareListResponseDtoOutputBuilder> {
  _$FareListResponseDtoOutput? _$v;

  ListBuilder<FareListResponseDtoOutputItemsInner>? _items;
  ListBuilder<FareListResponseDtoOutputItemsInner> get items =>
      _$this._items ??= ListBuilder<FareListResponseDtoOutputItemsInner>();
  set items(ListBuilder<FareListResponseDtoOutputItemsInner>? items) =>
      _$this._items = items;

  String? _nextCursor;
  String? get nextCursor => _$this._nextCursor;
  set nextCursor(String? nextCursor) => _$this._nextCursor = nextCursor;

  FareListResponseDtoOutputBuilder() {
    FareListResponseDtoOutput._defaults(this);
  }

  FareListResponseDtoOutputBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _nextCursor = $v.nextCursor;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(FareListResponseDtoOutput other) {
    _$v = other as _$FareListResponseDtoOutput;
  }

  @override
  void update(void Function(FareListResponseDtoOutputBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  FareListResponseDtoOutput build() => _build();

  _$FareListResponseDtoOutput _build() {
    _$FareListResponseDtoOutput _$result;
    try {
      _$result = _$v ??
          _$FareListResponseDtoOutput._(
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
            r'FareListResponseDtoOutput', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
