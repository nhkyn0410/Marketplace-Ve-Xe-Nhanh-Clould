// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'ward_list_response_dto_output_items_inner.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$WardListResponseDtoOutputItemsInner
    extends WardListResponseDtoOutputItemsInner {
  @override
  final String id;
  @override
  final String code;
  @override
  final String name;
  @override
  final String provinceId;

  factory _$WardListResponseDtoOutputItemsInner(
          [void Function(WardListResponseDtoOutputItemsInnerBuilder)?
              updates]) =>
      (WardListResponseDtoOutputItemsInnerBuilder()..update(updates))._build();

  _$WardListResponseDtoOutputItemsInner._(
      {required this.id,
      required this.code,
      required this.name,
      required this.provinceId})
      : super._();
  @override
  WardListResponseDtoOutputItemsInner rebuild(
          void Function(WardListResponseDtoOutputItemsInnerBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  WardListResponseDtoOutputItemsInnerBuilder toBuilder() =>
      WardListResponseDtoOutputItemsInnerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is WardListResponseDtoOutputItemsInner &&
        id == other.id &&
        code == other.code &&
        name == other.name &&
        provinceId == other.provinceId;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, provinceId.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'WardListResponseDtoOutputItemsInner')
          ..add('id', id)
          ..add('code', code)
          ..add('name', name)
          ..add('provinceId', provinceId))
        .toString();
  }
}

class WardListResponseDtoOutputItemsInnerBuilder
    implements
        Builder<WardListResponseDtoOutputItemsInner,
            WardListResponseDtoOutputItemsInnerBuilder> {
  _$WardListResponseDtoOutputItemsInner? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  String? _provinceId;
  String? get provinceId => _$this._provinceId;
  set provinceId(String? provinceId) => _$this._provinceId = provinceId;

  WardListResponseDtoOutputItemsInnerBuilder() {
    WardListResponseDtoOutputItemsInner._defaults(this);
  }

  WardListResponseDtoOutputItemsInnerBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _code = $v.code;
      _name = $v.name;
      _provinceId = $v.provinceId;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(WardListResponseDtoOutputItemsInner other) {
    _$v = other as _$WardListResponseDtoOutputItemsInner;
  }

  @override
  void update(
      void Function(WardListResponseDtoOutputItemsInnerBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  WardListResponseDtoOutputItemsInner build() => _build();

  _$WardListResponseDtoOutputItemsInner _build() {
    final _$result = _$v ??
        _$WardListResponseDtoOutputItemsInner._(
          id: BuiltValueNullFieldError.checkNotNull(
              id, r'WardListResponseDtoOutputItemsInner', 'id'),
          code: BuiltValueNullFieldError.checkNotNull(
              code, r'WardListResponseDtoOutputItemsInner', 'code'),
          name: BuiltValueNullFieldError.checkNotNull(
              name, r'WardListResponseDtoOutputItemsInner', 'name'),
          provinceId: BuiltValueNullFieldError.checkNotNull(
              provinceId, r'WardListResponseDtoOutputItemsInner', 'provinceId'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
