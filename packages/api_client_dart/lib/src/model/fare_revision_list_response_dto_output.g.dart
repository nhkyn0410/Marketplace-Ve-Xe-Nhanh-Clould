// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'fare_revision_list_response_dto_output.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$FareRevisionListResponseDtoOutput
    extends FareRevisionListResponseDtoOutput {
  @override
  final BuiltList<FareRevisionListResponseDtoOutputItemsInner> items;
  @override
  final DateTime? nextCursor;

  factory _$FareRevisionListResponseDtoOutput(
          [void Function(FareRevisionListResponseDtoOutputBuilder)? updates]) =>
      (FareRevisionListResponseDtoOutputBuilder()..update(updates))._build();

  _$FareRevisionListResponseDtoOutput._({required this.items, this.nextCursor})
      : super._();
  @override
  FareRevisionListResponseDtoOutput rebuild(
          void Function(FareRevisionListResponseDtoOutputBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  FareRevisionListResponseDtoOutputBuilder toBuilder() =>
      FareRevisionListResponseDtoOutputBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is FareRevisionListResponseDtoOutput &&
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
    return (newBuiltValueToStringHelper(r'FareRevisionListResponseDtoOutput')
          ..add('items', items)
          ..add('nextCursor', nextCursor))
        .toString();
  }
}

class FareRevisionListResponseDtoOutputBuilder
    implements
        Builder<FareRevisionListResponseDtoOutput,
            FareRevisionListResponseDtoOutputBuilder> {
  _$FareRevisionListResponseDtoOutput? _$v;

  ListBuilder<FareRevisionListResponseDtoOutputItemsInner>? _items;
  ListBuilder<FareRevisionListResponseDtoOutputItemsInner> get items =>
      _$this._items ??=
          ListBuilder<FareRevisionListResponseDtoOutputItemsInner>();
  set items(ListBuilder<FareRevisionListResponseDtoOutputItemsInner>? items) =>
      _$this._items = items;

  DateTime? _nextCursor;
  DateTime? get nextCursor => _$this._nextCursor;
  set nextCursor(DateTime? nextCursor) => _$this._nextCursor = nextCursor;

  FareRevisionListResponseDtoOutputBuilder() {
    FareRevisionListResponseDtoOutput._defaults(this);
  }

  FareRevisionListResponseDtoOutputBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _nextCursor = $v.nextCursor;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(FareRevisionListResponseDtoOutput other) {
    _$v = other as _$FareRevisionListResponseDtoOutput;
  }

  @override
  void update(
      void Function(FareRevisionListResponseDtoOutputBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  FareRevisionListResponseDtoOutput build() => _build();

  _$FareRevisionListResponseDtoOutput _build() {
    _$FareRevisionListResponseDtoOutput _$result;
    try {
      _$result = _$v ??
          _$FareRevisionListResponseDtoOutput._(
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
            r'FareRevisionListResponseDtoOutput', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
