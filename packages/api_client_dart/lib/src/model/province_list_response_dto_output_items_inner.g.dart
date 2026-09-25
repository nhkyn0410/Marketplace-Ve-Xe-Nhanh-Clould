// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'province_list_response_dto_output_items_inner.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ProvinceListResponseDtoOutputItemsInner
    extends ProvinceListResponseDtoOutputItemsInner {
  @override
  final String id;
  @override
  final String code;
  @override
  final String name;

  factory _$ProvinceListResponseDtoOutputItemsInner(
          [void Function(ProvinceListResponseDtoOutputItemsInnerBuilder)?
              updates]) =>
      (ProvinceListResponseDtoOutputItemsInnerBuilder()..update(updates))
          ._build();

  _$ProvinceListResponseDtoOutputItemsInner._(
      {required this.id, required this.code, required this.name})
      : super._();
  @override
  ProvinceListResponseDtoOutputItemsInner rebuild(
          void Function(ProvinceListResponseDtoOutputItemsInnerBuilder)
              updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ProvinceListResponseDtoOutputItemsInnerBuilder toBuilder() =>
      ProvinceListResponseDtoOutputItemsInnerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ProvinceListResponseDtoOutputItemsInner &&
        id == other.id &&
        code == other.code &&
        name == other.name;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(
            r'ProvinceListResponseDtoOutputItemsInner')
          ..add('id', id)
          ..add('code', code)
          ..add('name', name))
        .toString();
  }
}

class ProvinceListResponseDtoOutputItemsInnerBuilder
    implements
        Builder<ProvinceListResponseDtoOutputItemsInner,
            ProvinceListResponseDtoOutputItemsInnerBuilder> {
  _$ProvinceListResponseDtoOutputItemsInner? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  ProvinceListResponseDtoOutputItemsInnerBuilder() {
    ProvinceListResponseDtoOutputItemsInner._defaults(this);
  }

  ProvinceListResponseDtoOutputItemsInnerBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _code = $v.code;
      _name = $v.name;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ProvinceListResponseDtoOutputItemsInner other) {
    _$v = other as _$ProvinceListResponseDtoOutputItemsInner;
  }

  @override
  void update(
      void Function(ProvinceListResponseDtoOutputItemsInnerBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ProvinceListResponseDtoOutputItemsInner build() => _build();

  _$ProvinceListResponseDtoOutputItemsInner _build() {
    final _$result = _$v ??
        _$ProvinceListResponseDtoOutputItemsInner._(
          id: BuiltValueNullFieldError.checkNotNull(
              id, r'ProvinceListResponseDtoOutputItemsInner', 'id'),
          code: BuiltValueNullFieldError.checkNotNull(
              code, r'ProvinceListResponseDtoOutputItemsInner', 'code'),
          name: BuiltValueNullFieldError.checkNotNull(
              name, r'ProvinceListResponseDtoOutputItemsInner', 'name'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
