// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'vehicle_list_response_dto_output.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$VehicleListResponseDtoOutput extends VehicleListResponseDtoOutput {
  @override
  final BuiltList<VehicleListResponseDtoOutputItemsInner> items;
  @override
  final String? nextCursor;

  factory _$VehicleListResponseDtoOutput(
          [void Function(VehicleListResponseDtoOutputBuilder)? updates]) =>
      (VehicleListResponseDtoOutputBuilder()..update(updates))._build();

  _$VehicleListResponseDtoOutput._({required this.items, this.nextCursor})
      : super._();
  @override
  VehicleListResponseDtoOutput rebuild(
          void Function(VehicleListResponseDtoOutputBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  VehicleListResponseDtoOutputBuilder toBuilder() =>
      VehicleListResponseDtoOutputBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is VehicleListResponseDtoOutput &&
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
    return (newBuiltValueToStringHelper(r'VehicleListResponseDtoOutput')
          ..add('items', items)
          ..add('nextCursor', nextCursor))
        .toString();
  }
}

class VehicleListResponseDtoOutputBuilder
    implements
        Builder<VehicleListResponseDtoOutput,
            VehicleListResponseDtoOutputBuilder> {
  _$VehicleListResponseDtoOutput? _$v;

  ListBuilder<VehicleListResponseDtoOutputItemsInner>? _items;
  ListBuilder<VehicleListResponseDtoOutputItemsInner> get items =>
      _$this._items ??= ListBuilder<VehicleListResponseDtoOutputItemsInner>();
  set items(ListBuilder<VehicleListResponseDtoOutputItemsInner>? items) =>
      _$this._items = items;

  String? _nextCursor;
  String? get nextCursor => _$this._nextCursor;
  set nextCursor(String? nextCursor) => _$this._nextCursor = nextCursor;

  VehicleListResponseDtoOutputBuilder() {
    VehicleListResponseDtoOutput._defaults(this);
  }

  VehicleListResponseDtoOutputBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _nextCursor = $v.nextCursor;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(VehicleListResponseDtoOutput other) {
    _$v = other as _$VehicleListResponseDtoOutput;
  }

  @override
  void update(void Function(VehicleListResponseDtoOutputBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  VehicleListResponseDtoOutput build() => _build();

  _$VehicleListResponseDtoOutput _build() {
    _$VehicleListResponseDtoOutput _$result;
    try {
      _$result = _$v ??
          _$VehicleListResponseDtoOutput._(
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
            r'VehicleListResponseDtoOutput', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
