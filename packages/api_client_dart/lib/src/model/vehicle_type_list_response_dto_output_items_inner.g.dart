// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'vehicle_type_list_response_dto_output_items_inner.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$VehicleTypeListResponseDtoOutputItemsInner
    extends VehicleTypeListResponseDtoOutputItemsInner {
  @override
  final String id;
  @override
  final String code;
  @override
  final String name;
  @override
  final String? description;

  factory _$VehicleTypeListResponseDtoOutputItemsInner(
          [void Function(VehicleTypeListResponseDtoOutputItemsInnerBuilder)?
              updates]) =>
      (VehicleTypeListResponseDtoOutputItemsInnerBuilder()..update(updates))
          ._build();

  _$VehicleTypeListResponseDtoOutputItemsInner._(
      {required this.id,
      required this.code,
      required this.name,
      this.description})
      : super._();
  @override
  VehicleTypeListResponseDtoOutputItemsInner rebuild(
          void Function(VehicleTypeListResponseDtoOutputItemsInnerBuilder)
              updates) =>
      (toBuilder()..update(updates)).build();

  @override
  VehicleTypeListResponseDtoOutputItemsInnerBuilder toBuilder() =>
      VehicleTypeListResponseDtoOutputItemsInnerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is VehicleTypeListResponseDtoOutputItemsInner &&
        id == other.id &&
        code == other.code &&
        name == other.name &&
        description == other.description;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, description.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(
            r'VehicleTypeListResponseDtoOutputItemsInner')
          ..add('id', id)
          ..add('code', code)
          ..add('name', name)
          ..add('description', description))
        .toString();
  }
}

class VehicleTypeListResponseDtoOutputItemsInnerBuilder
    implements
        Builder<VehicleTypeListResponseDtoOutputItemsInner,
            VehicleTypeListResponseDtoOutputItemsInnerBuilder> {
  _$VehicleTypeListResponseDtoOutputItemsInner? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  String? _description;
  String? get description => _$this._description;
  set description(String? description) => _$this._description = description;

  VehicleTypeListResponseDtoOutputItemsInnerBuilder() {
    VehicleTypeListResponseDtoOutputItemsInner._defaults(this);
  }

  VehicleTypeListResponseDtoOutputItemsInnerBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _code = $v.code;
      _name = $v.name;
      _description = $v.description;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(VehicleTypeListResponseDtoOutputItemsInner other) {
    _$v = other as _$VehicleTypeListResponseDtoOutputItemsInner;
  }

  @override
  void update(
      void Function(VehicleTypeListResponseDtoOutputItemsInnerBuilder)?
          updates) {
    if (updates != null) updates(this);
  }

  @override
  VehicleTypeListResponseDtoOutputItemsInner build() => _build();

  _$VehicleTypeListResponseDtoOutputItemsInner _build() {
    final _$result = _$v ??
        _$VehicleTypeListResponseDtoOutputItemsInner._(
          id: BuiltValueNullFieldError.checkNotNull(
              id, r'VehicleTypeListResponseDtoOutputItemsInner', 'id'),
          code: BuiltValueNullFieldError.checkNotNull(
              code, r'VehicleTypeListResponseDtoOutputItemsInner', 'code'),
          name: BuiltValueNullFieldError.checkNotNull(
              name, r'VehicleTypeListResponseDtoOutputItemsInner', 'name'),
          description: description,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
