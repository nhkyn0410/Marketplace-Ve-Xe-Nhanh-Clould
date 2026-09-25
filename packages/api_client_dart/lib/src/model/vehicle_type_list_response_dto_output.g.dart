// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'vehicle_type_list_response_dto_output.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$VehicleTypeListResponseDtoOutput
    extends VehicleTypeListResponseDtoOutput {
  @override
  final BuiltList<VehicleTypeListResponseDtoOutputItemsInner> items;

  factory _$VehicleTypeListResponseDtoOutput(
          [void Function(VehicleTypeListResponseDtoOutputBuilder)? updates]) =>
      (VehicleTypeListResponseDtoOutputBuilder()..update(updates))._build();

  _$VehicleTypeListResponseDtoOutput._({required this.items}) : super._();
  @override
  VehicleTypeListResponseDtoOutput rebuild(
          void Function(VehicleTypeListResponseDtoOutputBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  VehicleTypeListResponseDtoOutputBuilder toBuilder() =>
      VehicleTypeListResponseDtoOutputBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is VehicleTypeListResponseDtoOutput && items == other.items;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, items.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'VehicleTypeListResponseDtoOutput')
          ..add('items', items))
        .toString();
  }
}

class VehicleTypeListResponseDtoOutputBuilder
    implements
        Builder<VehicleTypeListResponseDtoOutput,
            VehicleTypeListResponseDtoOutputBuilder> {
  _$VehicleTypeListResponseDtoOutput? _$v;

  ListBuilder<VehicleTypeListResponseDtoOutputItemsInner>? _items;
  ListBuilder<VehicleTypeListResponseDtoOutputItemsInner> get items =>
      _$this._items ??=
          ListBuilder<VehicleTypeListResponseDtoOutputItemsInner>();
  set items(ListBuilder<VehicleTypeListResponseDtoOutputItemsInner>? items) =>
      _$this._items = items;

  VehicleTypeListResponseDtoOutputBuilder() {
    VehicleTypeListResponseDtoOutput._defaults(this);
  }

  VehicleTypeListResponseDtoOutputBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(VehicleTypeListResponseDtoOutput other) {
    _$v = other as _$VehicleTypeListResponseDtoOutput;
  }

  @override
  void update(void Function(VehicleTypeListResponseDtoOutputBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  VehicleTypeListResponseDtoOutput build() => _build();

  _$VehicleTypeListResponseDtoOutput _build() {
    _$VehicleTypeListResponseDtoOutput _$result;
    try {
      _$result = _$v ??
          _$VehicleTypeListResponseDtoOutput._(
            items: items.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'VehicleTypeListResponseDtoOutput', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
