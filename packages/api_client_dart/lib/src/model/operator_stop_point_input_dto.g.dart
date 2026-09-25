// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'operator_stop_point_input_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const OperatorStopPointInputDtoTypeEnum
    _$operatorStopPointInputDtoTypeEnum_BUS_STATION =
    const OperatorStopPointInputDtoTypeEnum._('BUS_STATION');
const OperatorStopPointInputDtoTypeEnum
    _$operatorStopPointInputDtoTypeEnum_OFFICE =
    const OperatorStopPointInputDtoTypeEnum._('OFFICE');
const OperatorStopPointInputDtoTypeEnum
    _$operatorStopPointInputDtoTypeEnum_REST_STOP =
    const OperatorStopPointInputDtoTypeEnum._('REST_STOP');
const OperatorStopPointInputDtoTypeEnum
    _$operatorStopPointInputDtoTypeEnum_PICKUP_POINT =
    const OperatorStopPointInputDtoTypeEnum._('PICKUP_POINT');

OperatorStopPointInputDtoTypeEnum _$operatorStopPointInputDtoTypeEnumValueOf(
    String name) {
  switch (name) {
    case 'BUS_STATION':
      return _$operatorStopPointInputDtoTypeEnum_BUS_STATION;
    case 'OFFICE':
      return _$operatorStopPointInputDtoTypeEnum_OFFICE;
    case 'REST_STOP':
      return _$operatorStopPointInputDtoTypeEnum_REST_STOP;
    case 'PICKUP_POINT':
      return _$operatorStopPointInputDtoTypeEnum_PICKUP_POINT;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<OperatorStopPointInputDtoTypeEnum>
    _$operatorStopPointInputDtoTypeEnumValues = BuiltSet<
        OperatorStopPointInputDtoTypeEnum>(const <OperatorStopPointInputDtoTypeEnum>[
  _$operatorStopPointInputDtoTypeEnum_BUS_STATION,
  _$operatorStopPointInputDtoTypeEnum_OFFICE,
  _$operatorStopPointInputDtoTypeEnum_REST_STOP,
  _$operatorStopPointInputDtoTypeEnum_PICKUP_POINT,
]);

const OperatorStopPointInputDtoStatusEnum
    _$operatorStopPointInputDtoStatusEnum_ACTIVE =
    const OperatorStopPointInputDtoStatusEnum._('ACTIVE');
const OperatorStopPointInputDtoStatusEnum
    _$operatorStopPointInputDtoStatusEnum_INACTIVE =
    const OperatorStopPointInputDtoStatusEnum._('INACTIVE');

OperatorStopPointInputDtoStatusEnum
    _$operatorStopPointInputDtoStatusEnumValueOf(String name) {
  switch (name) {
    case 'ACTIVE':
      return _$operatorStopPointInputDtoStatusEnum_ACTIVE;
    case 'INACTIVE':
      return _$operatorStopPointInputDtoStatusEnum_INACTIVE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<OperatorStopPointInputDtoStatusEnum>
    _$operatorStopPointInputDtoStatusEnumValues = BuiltSet<
        OperatorStopPointInputDtoStatusEnum>(const <OperatorStopPointInputDtoStatusEnum>[
  _$operatorStopPointInputDtoStatusEnum_ACTIVE,
  _$operatorStopPointInputDtoStatusEnum_INACTIVE,
]);

Serializer<OperatorStopPointInputDtoTypeEnum>
    _$operatorStopPointInputDtoTypeEnumSerializer =
    _$OperatorStopPointInputDtoTypeEnumSerializer();
Serializer<OperatorStopPointInputDtoStatusEnum>
    _$operatorStopPointInputDtoStatusEnumSerializer =
    _$OperatorStopPointInputDtoStatusEnumSerializer();

class _$OperatorStopPointInputDtoTypeEnumSerializer
    implements PrimitiveSerializer<OperatorStopPointInputDtoTypeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'BUS_STATION': 'BUS_STATION',
    'OFFICE': 'OFFICE',
    'REST_STOP': 'REST_STOP',
    'PICKUP_POINT': 'PICKUP_POINT',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'BUS_STATION': 'BUS_STATION',
    'OFFICE': 'OFFICE',
    'REST_STOP': 'REST_STOP',
    'PICKUP_POINT': 'PICKUP_POINT',
  };

  @override
  final Iterable<Type> types = const <Type>[OperatorStopPointInputDtoTypeEnum];
  @override
  final String wireName = 'OperatorStopPointInputDtoTypeEnum';

  @override
  Object serialize(
          Serializers serializers, OperatorStopPointInputDtoTypeEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  OperatorStopPointInputDtoTypeEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      OperatorStopPointInputDtoTypeEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$OperatorStopPointInputDtoStatusEnumSerializer
    implements PrimitiveSerializer<OperatorStopPointInputDtoStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'ACTIVE': 'ACTIVE',
    'INACTIVE': 'INACTIVE',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'ACTIVE': 'ACTIVE',
    'INACTIVE': 'INACTIVE',
  };

  @override
  final Iterable<Type> types = const <Type>[
    OperatorStopPointInputDtoStatusEnum
  ];
  @override
  final String wireName = 'OperatorStopPointInputDtoStatusEnum';

  @override
  Object serialize(
          Serializers serializers, OperatorStopPointInputDtoStatusEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  OperatorStopPointInputDtoStatusEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      OperatorStopPointInputDtoStatusEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$OperatorStopPointInputDto extends OperatorStopPointInputDto {
  @override
  final String name;
  @override
  final OperatorStopPointInputDtoTypeEnum type;
  @override
  final String address;
  @override
  final String provinceId;
  @override
  final String wardId;
  @override
  final num latitude;
  @override
  final num longitude;
  @override
  final String? description;
  @override
  final OperatorStopPointInputDtoStatusEnum status;

  factory _$OperatorStopPointInputDto(
          [void Function(OperatorStopPointInputDtoBuilder)? updates]) =>
      (OperatorStopPointInputDtoBuilder()..update(updates))._build();

  _$OperatorStopPointInputDto._(
      {required this.name,
      required this.type,
      required this.address,
      required this.provinceId,
      required this.wardId,
      required this.latitude,
      required this.longitude,
      this.description,
      required this.status})
      : super._();
  @override
  OperatorStopPointInputDto rebuild(
          void Function(OperatorStopPointInputDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  OperatorStopPointInputDtoBuilder toBuilder() =>
      OperatorStopPointInputDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is OperatorStopPointInputDto &&
        name == other.name &&
        type == other.type &&
        address == other.address &&
        provinceId == other.provinceId &&
        wardId == other.wardId &&
        latitude == other.latitude &&
        longitude == other.longitude &&
        description == other.description &&
        status == other.status;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, type.hashCode);
    _$hash = $jc(_$hash, address.hashCode);
    _$hash = $jc(_$hash, provinceId.hashCode);
    _$hash = $jc(_$hash, wardId.hashCode);
    _$hash = $jc(_$hash, latitude.hashCode);
    _$hash = $jc(_$hash, longitude.hashCode);
    _$hash = $jc(_$hash, description.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'OperatorStopPointInputDto')
          ..add('name', name)
          ..add('type', type)
          ..add('address', address)
          ..add('provinceId', provinceId)
          ..add('wardId', wardId)
          ..add('latitude', latitude)
          ..add('longitude', longitude)
          ..add('description', description)
          ..add('status', status))
        .toString();
  }
}

class OperatorStopPointInputDtoBuilder
    implements
        Builder<OperatorStopPointInputDto, OperatorStopPointInputDtoBuilder> {
  _$OperatorStopPointInputDto? _$v;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  OperatorStopPointInputDtoTypeEnum? _type;
  OperatorStopPointInputDtoTypeEnum? get type => _$this._type;
  set type(OperatorStopPointInputDtoTypeEnum? type) => _$this._type = type;

  String? _address;
  String? get address => _$this._address;
  set address(String? address) => _$this._address = address;

  String? _provinceId;
  String? get provinceId => _$this._provinceId;
  set provinceId(String? provinceId) => _$this._provinceId = provinceId;

  String? _wardId;
  String? get wardId => _$this._wardId;
  set wardId(String? wardId) => _$this._wardId = wardId;

  num? _latitude;
  num? get latitude => _$this._latitude;
  set latitude(num? latitude) => _$this._latitude = latitude;

  num? _longitude;
  num? get longitude => _$this._longitude;
  set longitude(num? longitude) => _$this._longitude = longitude;

  String? _description;
  String? get description => _$this._description;
  set description(String? description) => _$this._description = description;

  OperatorStopPointInputDtoStatusEnum? _status;
  OperatorStopPointInputDtoStatusEnum? get status => _$this._status;
  set status(OperatorStopPointInputDtoStatusEnum? status) =>
      _$this._status = status;

  OperatorStopPointInputDtoBuilder() {
    OperatorStopPointInputDto._defaults(this);
  }

  OperatorStopPointInputDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _name = $v.name;
      _type = $v.type;
      _address = $v.address;
      _provinceId = $v.provinceId;
      _wardId = $v.wardId;
      _latitude = $v.latitude;
      _longitude = $v.longitude;
      _description = $v.description;
      _status = $v.status;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(OperatorStopPointInputDto other) {
    _$v = other as _$OperatorStopPointInputDto;
  }

  @override
  void update(void Function(OperatorStopPointInputDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  OperatorStopPointInputDto build() => _build();

  _$OperatorStopPointInputDto _build() {
    final _$result = _$v ??
        _$OperatorStopPointInputDto._(
          name: BuiltValueNullFieldError.checkNotNull(
              name, r'OperatorStopPointInputDto', 'name'),
          type: BuiltValueNullFieldError.checkNotNull(
              type, r'OperatorStopPointInputDto', 'type'),
          address: BuiltValueNullFieldError.checkNotNull(
              address, r'OperatorStopPointInputDto', 'address'),
          provinceId: BuiltValueNullFieldError.checkNotNull(
              provinceId, r'OperatorStopPointInputDto', 'provinceId'),
          wardId: BuiltValueNullFieldError.checkNotNull(
              wardId, r'OperatorStopPointInputDto', 'wardId'),
          latitude: BuiltValueNullFieldError.checkNotNull(
              latitude, r'OperatorStopPointInputDto', 'latitude'),
          longitude: BuiltValueNullFieldError.checkNotNull(
              longitude, r'OperatorStopPointInputDto', 'longitude'),
          description: description,
          status: BuiltValueNullFieldError.checkNotNull(
              status, r'OperatorStopPointInputDto', 'status'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
